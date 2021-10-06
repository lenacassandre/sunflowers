import { RCArguments } from "../../../types";
import Document from "../../../classes/document.class";
import Repository from "../../../classes/repository.class";

export function destroy<
    RepositoryType extends Repository<any, any>,
    DocType extends Document
>(
    repo: RepositoryType,
    ids: RCArguments<DocType>["destroy"]
) {
    const newRepoInstance = repo.clone();
    newRepoInstance.removed = newRepoInstance.removed.filter((doc: Document) => !ids.includes(doc._id));
    return newRepoInstance;
}