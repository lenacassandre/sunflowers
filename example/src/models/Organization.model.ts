import {User as UserBaseModel, Repository, Document} from '../../../src'

const repositoryName = "organization"

export class Organization extends Document {
    name: string

    constructor(orga: Organization) {
        super(repositoryName, orga)
        this.name = orga.name || ""
    }
}

// @ts-ignore
export class Organizations extends Repository<Organizations, Organization> {
    constructor(docs?: Organization[]) {
        super(repositoryName, Organizations, Organization, docs)
    }
}

export default new Organizations()