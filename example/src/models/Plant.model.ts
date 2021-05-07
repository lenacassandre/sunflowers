import {User as UserBaseModel, Repository, Document} from '../../../src'

const repositoryName = "plant"

export class Plant extends Document {
    name: string
    leafAmount: number

    constructor(plant: Plant) {
        super(repositoryName, plant)
        this.name = plant.name || "";
        this.leafAmount = plant.leafAmount || 0;
    }
}

// @ts-ignore
export class Plants extends Repository<Plants, Plant> {
    constructor(docs?: Plant[]) {
        super(repositoryName, Plants, Plant, docs)
    }
}

export default new Plants()