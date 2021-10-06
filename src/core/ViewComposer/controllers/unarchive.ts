import { RCArguments } from "../../../types";
import Document from "../../../classes/document.class";
import Repository from "../../../classes/repository.class";

export function unarchive<
    RepositoryType extends Repository<any, any>,
    DocType extends Document
>(
    repo: RepositoryType,
    ids: RCArguments<DocType>["unarchive"]
) {
    const newRepoDocuments: Document[] = [];
    const newRepoArchivedArray: Document[] = [];

    repo.archives.forEach(doc => {
        if(ids.includes(doc._id)) {
            doc.archived = false;
            newRepoDocuments.push(doc);
        } else {
            newRepoArchivedArray.push(doc)
        }
    })

    const newRepoInstance = repo.set(repo.concat(newRepoDocuments));
    newRepoInstance.archives = newRepoArchivedArray
    return newRepoInstance;
}