import { RCArguments } from "../../../types";
import Document from "../../../classes/document.class";
import Repository from "../../../classes/repository.class";

export function patch<
    RepositoryType extends Repository<any, any>,
    DocType extends Document
>(
    repo: RepositoryType,
    patches: RCArguments<DocType>["patch"]
) {
    const newRepoInstance = repo.clone(); // Clone the current instance

    // For each document to patch
    patches.forEach(patch => {
        if(patch._id) {
            const docIndex = newRepoInstance.findIndex((doc: Document) => doc._id === patch._id);

            if(docIndex >= 0) {
                // For each property to patch in the document
                for(const patchKey in patch) {
                    const key = patchKey as keyof typeof patch;
                    newRepoInstance[docIndex][key] = patch[key];
                }
            }
        }
    })

    // Nouvelle instance pour tous les documents qui ont été modifiés
    const newerRpoInstance = newRepoInstance.set(
        newRepoInstance.map((doc: Document) => {
            if(patches.some(d => d._id === doc._id)) {
                return new newRepoInstance.__DocumentClass(doc)
            } else {
                return doc
            }
        })
    )

    return newerRpoInstance;
}