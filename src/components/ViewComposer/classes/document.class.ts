import { RCArguments, RCError, RCReturn } from "../../../types";
import randomId from "../../../utils/randomId";
import {RepositoryPromise, useRepositoryCallbacks, } from "../useRepositories"
import Repository from "./repository.class";

export default class Document {
    private __repositoryName: string;
    public _id: string;
    public dev?: true; // Can only be seen on the dev version
	public order?: number;
	public archived?: boolean;
    public removed?: boolean;
	public color?: string;
    public created_at: Date;
    public updated_at: Date
    public organizations: string[]; // foreign keys oragnization

    // Cache. Le cache peut êtrre
    private _cache: {
        [key: string]: {
            funcsLastDependenciesValues: any[],
            funcsLastReturnData: any
        }
    } = {}

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
    constructor(repositoryName: string, doc: {[prop: string]: any}) {
        this.__repositoryName = repositoryName

        // Si le document n'a pas d'id, un temporaire est créé
        this._id = doc._id || randomId();

        this.created_at = new Date(doc.created_at)
        this.updated_at = new Date(doc.updated_at)

        this.organizations = doc.organizations || [];

        // if() pour que la propriété n'aparaisse pas si elle n'existe pas
        if (doc.dev) {
            this.dev = true;
        }

        // if() pour que la propriété n'aparaisse pas si elle n'existe pas
        if (doc.order) {
            this.order = doc.order;
		}

		// if() pour que la propriété n'aparaisse pas si elle n'existe pas
        if (doc.archived) {
            this.archived = doc.archived;
		}

        // if() pour que la propriété n'aparaisse pas si elle n'existe pas
        if (doc.removed) {
            this.removed = doc.removed;
		}

		// if() pour que la propriété n'aparaisse pas si elle n'existe pas
        if (doc.color) {
            this.color = doc.color;
        }
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Affecte une propriétée donnée du document à une nouvelle valeur donnée, sur le serveur et le client.
     * @param prop Propriété que l'on souhaite sauvegarder
     * @param value Nouvelle valeur de la propriété que l'on souhaite sauvegarder
     */
    public patch(prop: keyof this, value: any): RepositoryPromise<RCReturn<this>["patch"], RCError["patch"]>;
    /**
     * Modifie le document selon le patch donné sur le serveur et le client.
     * @param patchObject Modifications que l'on souhaite apporter au document
     */
    public patch(patchObject: Partial<this>): RepositoryPromise<RCReturn<this>["patch"], RCError["patch"]>;
    public patch(arg1: Partial<this> | keyof this, value?: any): RepositoryPromise<RCReturn<this>["patch"], RCError["patch"]> {
        let patches: RCArguments<this>["patch"];

        if (typeof arg1 === "string") {
            //@ts-ignore TODO: corriger cette erreur
            patches = [{ [arg1]: value, _id: this._id }];
        }
        else if (typeof arg1 === "object") {
            patches =  [{ ...arg1, _id: this._id }]
        }
        else {
            throw new Error(
                `No overload match this call (document.patch(prop|patch: ${typeof arg1}, value: ${typeof value})).`
            );
        }

        // FIXME
        // @ts-ignore
        return useRepositoryCallbacks.forwardPatch(this.__repositoryName, patches);
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Supprime le document
     */
    public remove(): RepositoryPromise<RCReturn<this>["remove"], RCError["remove"]> {
        return useRepositoryCallbacks.forwardRemove(this.__repositoryName, [this._id]);
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Restaure le document
     */
     public restore(): RepositoryPromise<RCReturn<this>["restore"], RCError["restore"]> {
        return useRepositoryCallbacks.forwardRestore(this.__repositoryName, [this._id]);
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Supprime définitivement le document
     */
     public destroy(): RepositoryPromise<RCReturn<this>["destroy"], RCError["destroy"]> {
        return useRepositoryCallbacks.forwardDestroy(this.__repositoryName, [this._id]);
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Archive le document
     */
     public archive(): RepositoryPromise<RCReturn<this>["archive"], RCError["archive"]> {
        return useRepositoryCallbacks.forwardArchive(this.__repositoryName, [this._id]);
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Désarchive le document
     */
     public unarchive(): RepositoryPromise<RCReturn<this>["unarchive"], RCError["unarchive"]> {
        return useRepositoryCallbacks.forwardUnarchive(this.__repositoryName, [this._id]);
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Le mémo permet d'enregistrer la valeur de retour d'une fonction,
     * @param func
     * @param funcsDependencies
     * @param memoId
     */
    protected memo<ReturnType = any>(func: () => ReturnType, funcsDependencies: any[], memoId: string): ReturnType {
        const resetMemo = () => {
            const returnValue = func();

            this._cache[memoId] = {
                funcsLastDependenciesValues: funcsDependencies,
                funcsLastReturnData: returnValue
            };

            return returnValue;
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Si le mémo a une valeur en cache et que les dépendances sont égales, on envoie la valeur en cache, sinon, on recalcule.
        if(!this._cache[memoId]) { // Si le memo n'a as encore été appelé
            return resetMemo();
        }
        else { // S'il a déjà été appelé
            if(areArraysEqual( // Si les binding values sont égales, on renvoie la dernière valeur de retour de la fonction
                this._cache[memoId].funcsLastDependenciesValues,
                funcsDependencies
            )) {
                return this._cache[memoId].funcsLastReturnData;
            } else { // Sinon, on recalcule la valeur de retour de la fonction passée.
                return resetMemo();
            }
        }
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Return a plain javascript object.
     * @param includeId Should the returned object include its Id ?
     * @returns
     */
    public toObject(includeId?: boolean): Omit<this, "v"> {
        const objectInstance: any = {...this};

        delete objectInstance.__repositoryName;
        delete objectInstance.created_at;
        delete objectInstance.updated_at;

        if(!includeId) {
            delete objectInstance._id;
        }

        return objectInstance
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////::
/////////////////////////////////////////////////////////////////////////////////////////////::
/////////////////////////////////////////////////////////////////////////////////////////////::
/////////////////////////////////////////////////////////////////////////////////////////////::
/////////////////////////////////////////////////////////////////////////////////////////////::

// Check if two arrays are equals
function areArraysEqual(a: any[], b: any[]) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}