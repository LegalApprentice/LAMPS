import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Toast } from '../shared/emitter.service';
import { HubServiceLocator } from '../shared/service-locator';

//import { DocumentHub, TopicPayload, messageBase } from './documentHub.message.tsxxx';
import { Tools } from '../shared/foTools';
import { PluginData } from '@app/models';
import { CheckboxSelectionComponent } from 'ag-grid-community';
import { LogLevel } from '@microsoft/signalr';



export class PluginPayload {
  topic: string;
  payload: PluginData;

  constructor(topic: string, payload: any) {
    this.topic = topic;
    this.payload = new PluginData(payload);
  }
}

export class TopicPayload {
  topic: string;
  payload: any;

  constructor(topic: string, payload: any) {
    this.topic = topic;
    this.payload = payload;
  }
}

class Plugins {
  [key: string]: PluginData;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentHubService {

  connection: signalR.HubConnection;
  pongSubject: Subject<any>;
  topicPayloadSubject: Subject<TopicPayload>;
  pluginSubject: Subject<PluginPayload>;
  hubURL: string;
  pluginDictionary: Plugins = {} 

  constructor() {
  }

  pluginList() {
    return Object.values(this.pluginDictionary);
  }

  establishHubConnection() {
    if (this.connection) {
      return this.connection;
    }

    const serviceOptions = new HubServiceLocator({
      serviceKey: 'documentHubService$',
      endpoint: `/documentHub`
    });

    this.hubURL = serviceOptions.getUrl();
    //Toast.info('Hub Connection', url);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubURL, {
        withCredentials: false,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(LogLevel.Trace)
      .build();

    return this.connection;
  }

  doStart(success: () => void, failure: () => void) {
    if (this.connection) {
      Toast.warning('reuse connection');
      success();
      return;
    }

    const name = 'Legal Pad'

    this.establishHubConnection()
      .start()
      .then(() => {
        Toast.success(`${name} hub is ready`, this.hubURL);
        success();
      })
      .catch((error) => {
        Toast.error(`${name} hub has not connected`, this.hubURL);
        failure();
      })
      .finally(() => {
          //Toast.info(`${name} hub connection complete`, this.hubURL);
      });
  }

  doStop(success: () => void) {
    if (this.connection) {
      this.connection.stop();
      this.connection.onclose(success);
      this.connection = undefined;
    }
  }


  public Pong$(): Subject<any> {
    if (!this.pongSubject) {
      this.pongSubject = new Subject<any>();
      this.connection.on('Pong', (data) => {
        this.pongSubject.next(data);
      });
    }

    return this.pongSubject;
  }

  doPing() {
    const msg = `ping ${Tools.getNowIsoDate()}`;
    this.connection.invoke('Ping', msg);

  }


  public TopicPayload$(): Subject<TopicPayload> {
    if (!this.topicPayloadSubject) {
      this.topicPayloadSubject = new Subject<TopicPayload>();
      this.connection.on('TopicPayload', (topic, payload) => {
        const data = new TopicPayload(topic, payload);
        this.topicPayloadSubject.next(data);
      });
    }

    return this.topicPayloadSubject;
  }

  public broadcastTopicPayload(topic: string, payload: any): boolean {
    if (this.connection) {
      this.connection.invoke('TopicPayload', topic, payload);
      return true;
    }
    return false;
  }

  public broadcastTopic(topic: string, payload: any): boolean {
    if (this.connection) {
      this.connection.invoke(topic, payload);
      return true;
    }
    return false;
  }

  doOpenCase(caseID: string) {
    this.broadcastTopicPayload('OpenCase', caseID);
    Toast.info(`Sending caseID ${caseID}`, "Open In Marker")

  }

  public Plugin$(): Subject<PluginPayload> {
    if (!this.pluginSubject) {
      this.pluginSubject = new Subject<PluginPayload>();
      this.connection.on('Plugin', (topic, payload) => {
        const data = new PluginPayload(topic, payload);
        const plugin = data.payload;
        //Toast.info(`active plugin`,  Tools.stringify(plugin));
          
        //replace / track plugins
        this.pluginDictionary[plugin.sourceGuid] = plugin;

        const list = this.pluginList();
        list.forEach((obj) =>{
          const sec = Tools.getDeltaSeconds(obj.timeStamp);
          if (sec > 10) {
            console.log(`deleting plugin`, obj)
            delete this.pluginDictionary[obj.sourceGuid]
          }
        });

        this.pluginSubject.next(data);
      });
    }

    return this.pluginSubject;
  }

  // public broadcastPlugin(topic: string, payload: any): boolean {
  //   if (this.connection) {
  //     this.connection.invoke('Plugin', topic, payload);
  //     return true;
  //   }
  //   return false;
  // }

}
