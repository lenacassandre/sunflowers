import { RCArguments } from "../../../types";
import Document from "../../../classes/document.class";
import Repository from "../../../classes/repository.class";

export function forceDestroy<
    RepositoryType extends Repository<any, any>,
    DocType extends Document
>(
    repo: RepositoryType,
    ids: RCArguments<DocType>["forceDestroy"]
) {
    const newRepoInstance = repo.set(repo.filter((doc: Document) => !ids.includes(doc._id)));
    newRepoInstance.removed = newRepoInstance.removed.filter((doc: Document) => !ids.includes(doc._id));
    newRepoInstance.archives = newRepoInstance.archives.filter((doc: Document) => !ids.includes(doc._id));
    return newRepoInstance;
}