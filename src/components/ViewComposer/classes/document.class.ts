import randomId from "../../../utils/randomId";
import {FactoryPromise, useFactoryCallbacks, PatchResponse, DeleteResponse} from "../useFactories"

export default class Document {
    private __factoryName: string;
    public _id: string;
    public dev?: true; // Can only be seen on the dev version
	public order?: number;
	public archived?: boolean;
	public color?: string;
    public created_at: Date;
    public updated_at: Date

    // Cache. Le cache peut êtrre
    private _cache: {
        [key: string]: {
            funcsLastDependenciesValues: any[],
            funcsLastReturnData: any
        }
    } = {}

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
    constructor(factoryName: string, doc: {[prop: string]: any}) {
        this.__factoryName = factoryName

        // Si le document n'a pas d'id, un temporaire est créé
        this._id = doc._id || randomId();

        this.created_at = new Date(doc.created_at)
        this.updated_at = new Date(doc.updated_at)

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
        if (doc.color) {
            this.color = doc.color;
        }
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Affecte une propriétée donnée du document à une nouvelle valeur donnée, sur le serveur et le client.
     * @param prop Propriété que l'on souhaite modifier
     * @param value Nouvelle valeur de la propriété que l'on souhaite modifier
     */
    public patch(prop: keyof this, value: any): FactoryPromise<PatchResponse<this>>;
    /**
     * Modifie le document selon le patch donné sur le serveur et le client.
     * @param patchObject Modifications que l'on souhaite apporter au document
     */
    public patch(patchObject: Partial<this>): FactoryPromise<PatchResponse<this>>;
    public patch(arg1: Partial<this> | keyof this, value?: any): FactoryPromise<PatchResponse<this>> {
        if (typeof arg1 === "string") {
            const patches = [{ [arg1]: value, _id: this._id }] as (Partial<this> & { _id: string; })[] ;
            return useFactoryCallbacks.forwardPatch<this>(this.__factoryName, patches);
        }
        else if (typeof arg1 === "object") {
            const patches =  [{ ...arg1, _id: this._id }]
            return useFactoryCallbacks.forwardPatch<this>(this.__factoryName, patches);
        }
        else {
            throw new Error(
                `No overload match this call (document.patch(prop|patch: ${typeof arg1}, value: ${typeof value})).`
            );
        }
    }

    //◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
    //◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

    /**
     * Supprime le document
     * @param mode Suppression en cascade ?
     */
    public delete(cascade?: true) {
        return useFactoryCallbacks.forwardDelete(this.__factoryName, [this._id]);
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

        delete objectInstance.__factoryName;
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