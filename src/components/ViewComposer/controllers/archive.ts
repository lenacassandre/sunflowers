import { RCArguments } from "../../../types";
import Document from "../classes/document.class";
import Repository from "../classes/repository.class";

export function archive<
    RepositoryType extends Repository<any, any>,
    DocType extends Document
>(
    repo: RepositoryType,
    ids: RCArguments<DocType>["archive"]
) {
    const newRepoArray: Document[] = [];
    const newRepoArchivedDocuments: Document[] = [];

    repo.forEach(doc => {
        if(ids.includes(doc._id)) {
            doc.archived = true;
            newRepoArchivedDocuments.push(doc);
        } else {
            newRepoArray.push(doc)
        }
    })

    const newRepoInstance = repo.set(newRepoArray);
    newRepoInstance.archives.push(...newRepoArchivedDocuments)
    return newRepoInstance;
}