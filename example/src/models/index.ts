import { Repository } from "../../../src"
import user, { Users, User } from "./User.model"
import plant, { Plants, Plant } from "./Plant.model"
import organization, { Organizations, Organization } from "./Organization.model"

export declare type RepositoriesType = {
    // @ts-ignore
    user: Repository<Users, User>,
    // @ts-ignore
    plant: Repository<Plants, Plant>,
    // @ts-ignore
    organization: Repository<Organizations, Organization>,
}

export default {
    user,
    plant,
    organization
}