/*
 * Implementation of storage using fs
 */

const fs = require('fs');
const path = require('path');

class FileDataStorage {
    constructor() {
        this._basePath = path.join(__dirname, '/../.data');

        fs.mkdirSync(this._basePath, {
            recursive: true,
        });

        this._partition = null;
    };

    usePartition(name) {
        fs.mkdirSync(path.join(this._basePath, `/${name}`), {
            recursive: true,
        })

        this._partition = name;
        return this;
    };

    async create(id, data) {
        const partitionDirpath = this._getPartitionDirPath();

        return await new Promise((resolve, reject) => {
            fs.open(path.join(partitionDirpath, `/${id}.json`), 'wx', (err, fileDescriptor) => {
                if (err || !fileDescriptor) {
                    reject(err);
                    return;
                }

                const strindData = JSON.stringify(data);
                fs.writeFile(fileDescriptor, strindData, err => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    fs.close(fileDescriptor, err => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(this);
                    })
                });
            });
        });
    };

    async read(id) {
        const partitionDirpath = this._getPartitionDirPath();

        return await new Promise((resolve, reject) => {
            fs.readFile(path.join(partitionDirpath, `/${id}.json`), 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(JSON.parse(data));
            })
        });
    };

    async update(id, data) {
        const partitionDirpath = this._getPartitionDirPath();

        return await new Promise((resolve, reject) => {
            fs.open(path.join(partitionDirpath, `/${id}.json`), 'r+', (err, fileDescriptor) => {
                if (err || !fileDescriptor) {
                    reject(err);
                    return;
                }

                fs.ftruncate(fileDescriptor, err => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const strindData = JSON.stringify(data);
                    fs.writeFile(fileDescriptor, strindData, err => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        fs.close(fileDescriptor, err => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve(this);
                        })
                    });
                });
            });
        });
    };

    async delete(id) {
        const partitionDirpath = this._getPartitionDirPath();

        return await new Promise((resolve, reject) => {
            fs.unlink(path.join(partitionDirpath, `/${id}.json`), err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this);
            });
        });
    };

    async save(id, data) {
        this._getPartitionDirPath();

        try {
            await this.read(id);
            return this.update(id, data);
        } catch (e) {
            return this.create(id, data);
        }

    };

    async deleteOwned(id, relatedPartition, ownedField) {
        const relatedStorage = new this.constructor().usePartition(relatedPartition);
        try {
            const dto = await this.read(id);
            const listToRemove = dto[ownedField]
            if (!Array.isArray(listToRemove)) {
                throw new Error(`Related filed is not an array of ids`);
            }

            await Promise.all(listToRemove.map(rId => {
                return (async () => {
                    try {
                        await relatedStorage.delete(rId);
                    } catch (e) {
                        console.error(`Cannot delete owned record ${this._partition}.${ownedField} -> ${relatedPartition}[${rId}]`)
                    }
                })();
            }));
        } catch (e) {
            console.error(e, e.stack)
            throw new Error(`Can't remove owned! ${this._partition}.${ownedField} -> ${relatedPartition}`);
        }
    };

    async deleteFromOwner(id, ownerIdField, relatedPartition, ownedField) {
        const relatedStorage = new this.constructor().usePartition(relatedPartition);
        try {
            const ownedDto = await this.read(id);
            const ownerId = ownedDto[ownerIdField];

            const ownerDto = await relatedStorage.read(ownerId);
            let listOfOwned = ownerDto[ownedField]
            if (!Array.isArray(listOfOwned)) {
                throw new Error(`Related filed is not an array of ids`);
            }

            if(!listOfOwned.includes(id)) {
                console.warn(`Owner has no relation where ${relatedPartition}.${ownedField} -> ${this._partition}[${id}]`)
                return;
            }

            listOfOwned = listOfOwned.filter(rId => rId !== id);

            ownerDto[ownedField] = listOfOwned;

            await relatedStorage.update(ownerId, ownerDto);
            
        } catch (e) {
            console.error(e, e.stack)
            throw new Error(`Can't remove from owner! ${relatedPartition}.${ownedField} -> ${this._partition}[${id}]`);
        }
    }

    async linkToOwner(id, ownerIdField, relatedPartition, ownedField) {
        const relatedStorage = new this.constructor().usePartition(relatedPartition);
        try {
            const ownedDto = await this.read(id);
            const ownerId = ownedDto[ownerIdField];

            const ownerDto = await relatedStorage.read(ownerId);

            if (!Array.isArray(ownerDto[ownedField])) {
                throw new Error(`Related filed is not an array of ids`);
            }

            ownerDto[ownedField].push(id);

            await relatedStorage.update(ownerId, ownerDto);
            
        } catch (e) {
            console.error(e, e.stack)
            throw new Error(`Can't link to owner! ${relatedPartition}.${ownedField} -> ${this._partition}[${id}]`);
        }
    }

    _getPartitionDirPath() {
        if (!this._partition) {
            throw new Error(`Set partition first!`);
        };

        return path.join(this._basePath, `/${this._partition}`);
    };
};

module.exports = FileDataStorage;
