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

    _getPartitionDirPath() {
        if (!this._partition) {
            throw new Error(`Set partition first!`);
        };

        return path.join(this._basePath, `/${this._partition}`);
    };
};

module.exports = FileDataStorage;
