import { LaAtom } from '../shared/la-atom';


export interface IUserNotes {
    notes: string;
    createTagDisplayRecord(): any;
}

export interface IUserTags {
    userTags: Array<LaUserTag>;
    addUserTag(tag: LaUserTag): LaUserTag;
    removeUserTag(tag: LaUserTag): LaUserTag;
    createTagDisplayRecord(): any;
}

export interface IGroupRef {
    groupIDs: string;
    addGroupID(groupID: string): string;
    removeGroupID(groupID: string): string;
    clearGroupIDs();
}
export interface ITagsAndNotes extends IUserNotes, IUserTags {
    getSummary():string;
    anchorTag(): string;
}

export class LaUserTag extends LaAtom {

    tagName: string;
    tagValue: string;
    dropDownList: Array<string>;
    tagList: Array<LaUserTag>;

    constructor(properties?: any) {
        super(properties);
    }

    addTag(name: string) {
        const tag = new LaUserTag({ tagName: name })
        this.appendTag(tag)
        return tag;
    }

    findTag(name: string) {
        return this.tagList?.filter(item => item.tagName == name)[0]
    }

    userTagList() {
        return this.tagList;
    }

    appendTag(child: LaUserTag) {
        if (!this.tagList) {
            this.tagList = new Array<LaUserTag>()
        }
        this.tagList.push(child)
        return child;
    }

    asSpec() {
        if (this.dropDownList?.length > 0) {
            const list = this.dropDownList.join(",")
            return `${this.tagName}:[${list}]`
        } else {
            return `${this.tagName}`
        }
    }

    setDropDownList(dropdown: Array<string>) {
        this.dropDownList = dropdown
        this.tagValue = dropdown[0]
    }

    extendRecord(data: any, foundCols: any) {
        const tag = this;
        if (tag.isTagGroup) {
            data['TagGroup'] = tag.tagName
            tag.tagList.forEach(subtag => {
                const tagName = `${tag.tagName}_${subtag.tagName}`
                data[tagName] = subtag.tagValue
                foundCols[tagName] = subtag.tagName
            });
        } else {
            data[tag.tagName] = tag.tagValue
            foundCols[tag.tagName] = tag.tagName
        }
    }

    get isTagGroup() {
        return this.tagList?.length > 0
    }

    applyJSON(data: any): LaUserTag {
        this.tagList?.forEach(child => {
            const value = data[child.tagName]
            if (value) {
                child.tagValue = value;
            }
        })
        return this;
    }

    duplicate() {
        const list = this.tagList?.map(item => {
            const child = item.duplicate()
            return child;
        })

        //console.log(JSON.stringify(list,undefined, 3))


        const result = new LaUserTag({
            tagName: this.tagName,
            tagValue: this.tagValue,
            dropDownList: this.dropDownList,
            tagList: list
        })


        return result;
    }
}

export class LaTagDefinitions extends LaAtom {
    tagList: Array<LaUserTag> = new Array<LaUserTag>();
    tagLookup: { [name: string]: LaUserTag } = {};

    constructor(properties?: any) {
        super(properties);
        this.init();
    }

    add(tag: LaUserTag) {
        this.tagList.push(tag)
        this.tagLookup[tag.tagName] = tag
        return tag;
    }



    convertNameSpec(nameSpec: string) {
        const list = nameSpec.split(':')
        const name = list[0]
        var spec = list.length == 1 ? '' : list[1].replace('[', '').replace(']', '')
        return { name, spec }
    }

    findTag(name: string): LaUserTag {
        return this.tagLookup[name];
    }

    establishTag(tagSpec: string, type: string = '', hide: boolean = false): LaUserTag {
        const { name, spec } = this.convertNameSpec(tagSpec)

        var found: LaUserTag = hide ? undefined : this.tagLookup[name];
        if (!found) {
            found = new LaUserTag({ tagName: name })
            if (!hide) {
                this.add(found)
            }
        }

        if (type != '') {
            type.split(';').forEach(nameSpec => {
                const { name, spec } = this.convertNameSpec(nameSpec)
                if (!found.findTag(name)) {
                    const tag = this.establishTag(name, '', true)
                    found.appendTag(tag)
                    if (spec != '') {
                        tag.setDropDownList(spec.split(','))
                    }
                }
            })
        }
        return found;
    }

    init() {
        this.establishTag("correction", "reason;author;date")
    }

    toJson() {
        const result = {};
        this.tagList.forEach(tag => {
            const key = tag.tagName;
            let value = "";
            if (tag.tagList?.length > 0) {
                value = tag.tagList.map(tag => tag.asSpec()).join(';')
            }
            result[key] = value;
        })

        return result;

    }

    fromJson(obj) {
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            this.establishTag(key, value)
        })
        return this;

    }
}