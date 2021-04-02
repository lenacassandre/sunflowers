import Document from "./document.class"

export default class User extends Document {
    userName: string;
    hasPassword: boolean; // Par défaut, automaton envoie toujours cette propriété pour indiquer si un mdp a été enregistré
    roles: number[]

    constructor(factoryName: string, user: Partial<User>) {
        super(factoryName, user)
        this.userName = user.userName || "";
        this.hasPassword = user.hasPassword ? true : false;
        this.roles = user.roles || [];
    }
}