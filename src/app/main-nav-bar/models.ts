export class SubMenu{
    public name: string = '';
    public id: string = '';
}

export class NavMenuItem {
    public name: string = '';
    public isActive: boolean = false;
    public subMenus?: SubMenu[] = [];
    public routingLink?: string;
}