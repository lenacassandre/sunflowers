import { Factory } from "../../../src"
import user, { Users, User } from "./User.model"

export declare type FactoriesType = {
    user: Factory<Users, User>,
}

export default {
    user
}