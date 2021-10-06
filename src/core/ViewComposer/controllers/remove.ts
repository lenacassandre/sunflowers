import { RCArguments } from "../../../types";
import Document from "../../../classes/document.class";
import Repository from "../../../classes/repository.class";

export function remove<
    RepositoryType extends Repository<any, any>,
    DocType extends Document
>(
    repo: RepositoryType,
    ids: RCArguments<DocType>["remove"]
) {
    const newRepoArray: DocType[] = [];
    const newRepoArchives: DocType[] = [];
    const newRepoRemovedDocuments: DocType[] = [];

    repo.forEach(doc => {
        if(ids.includes(doc._id)) {
            doc.removed = true;
            newRepoRemovedDocuments.push(doc);
        } else {
            newRepoArray.push(doc)
        }
    })

    repo.archives.forEach(doc => {
        if(ids.includes(doc._id)) {
            doc.removed = true;
            newRepoRemovedDocuments.push(doc);
        } else {
            newRepoArchives.push(doc)
        }
    })

    const newRepoInstance = repo.set(newRepoArray);
    newRepoInstance.removed.push(...newRepoRemovedDocuments)
    newRepoInstance.archives = [...newRepoArchives]
    return newRepoInstance;
}