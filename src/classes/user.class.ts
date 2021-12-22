import Document from "./document.class"

export default class User extends Document {
    userName: string;
    hasPassword: boolean; // Par défaut, automaton envoie toujours cette propriété pour indiquer si un mdp a été enregistré
    roles: string[];
    permissions: string[];

    constructor(repositoryName: string, user: Partial<User>) {
        super(repositoryName, user)
        this.userName = user.userName || "";
        this.hasPassword = user.hasPassword ? true : false;
        this.roles = user.roles || [];
        this.permissions = user.permissions || [];
    }

    public hasRole = (role: string) => this.roles.includes(role);
    public hasOneOfManyRoles = (roles: string[]) => roles.some(role => this.roles.includes(role));
    public hasManyRoles = (roles: string[]) => roles.every(role => this.roles.includes(role));

    public hasPermission = (permission: string) => this.permissions.includes(permission);
    public hasOneOfManyPermissions = (permissions: string[]) => permissions.some(permission => this.permissions.includes(permission));
    public hasManyPermissions = (permissions: string[]) => permissions.every(permission => this.permissions.includes(permission));
}
