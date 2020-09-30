interface RequestDataInterface {
    path: string,
    method: string,
    query: object,
    payload: string,
    headers: {string: string},
};