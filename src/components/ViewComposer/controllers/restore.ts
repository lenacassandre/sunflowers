import { RCReturn } from "../../../types";
import Document from "../classes/document.class";
import Repository from "../classes/repository.class";

export function restore<
    RepositoryType extends Repository<any, any>,
    DocType extends Document
>(
    repo: RepositoryType,
    ids: RCReturn<DocType>["restore"]
) {
    const newRepoDocuments: Document[] = [];
    const newRepoArchives: Document[] = [];
    const newRepoRemovedArray: Document[] = [];

    repo.removed.forEach((doc) => {
        if(ids.includes(doc._id)) {
            doc.removed = false;

            if(doc.archived) {
                newRepoArchives.push(doc);
            } else {
                newRepoDocuments.push(doc)
            }
        } else {
            newRepoRemovedArray.push(doc)
        }
    })

    const newRepoInstance = repo.set(repo.concat(newRepoDocuments));
    newRepoInstance.archives = [...newRepoInstance.archives, ...newRepoArchives]
    newRepoInstance.removed = newRepoRemovedArray
    return newRepoInstance;
}