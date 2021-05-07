export type StoreType = {
    userName: string,
    firstName: string,
    lastName: string,
    roles: number[],
    password: string,
    cpassword: string
}

const store: StoreType = {
    userName: "",
    firstName: "",
    lastName: "",
    roles: [2],
    password: "",
    cpassword: ""
};

export default store
