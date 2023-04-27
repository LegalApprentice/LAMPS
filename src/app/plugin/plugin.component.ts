import { Component, OnInit } from '@angular/core';
import { EmitterService, Toast } from '@app/shared';
import { DocumentHubService } from '@app/sharedComponents/documentHub.service';



@Component({
  selector: 'app-plugin',
  templateUrl: './plugin.component.html'
})
export class PluginComponent implements OnInit {
  banner:string;
  plugins:any = [];

  constructor(private hubService: DocumentHubService) { }

  ngOnInit(): void {
    this.banner = "Enrichment and Markup Services";
    EmitterService.registerCommand(this, "RefreshPlugins", this.onRefreshPlugins);
    EmitterService.processCommands(this);
  }

  onRefreshPlugins() {
    this.plugins = this.hubService.pluginList();
  }


  doStart(plugin: any) {
    this.hubService.broadcastTopic('Start', plugin);
  }

  doStop(plugin: any) {
    this.hubService.broadcastTopic('Stop', plugin);
  }
}
