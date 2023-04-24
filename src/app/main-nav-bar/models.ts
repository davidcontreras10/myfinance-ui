export class NavMenuItem {
    public name: string = '';
    public isActive: boolean = false;
    public subMenus?: string[] = [];
    public routingLink?: string;
}