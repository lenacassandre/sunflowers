import { RCArguments } from "../../../types";
import Document from "../../../classes/document.class";
import Repository from "../../../classes/repository.class";

export function post<
    RepositoryType extends Repository<any, any>,
    DocType extends Document
>(
    repo: RepositoryType,
    docs: RCArguments<DocType>["post"]
) {
    return repo.set([...repo, ...docs])
}