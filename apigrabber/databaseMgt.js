const { MongoClient } = require("mongodb");

class databaseMgt {
    constructor(uri) {
        this.client = new MongoClient(uri);
    }

    async open() {
        await this.client.connect().then(function () { console.log('Database Connected') }).catch(function (error) { reject(error) });
        this.database = this.client.db("parkingEasy");
    }

    async close() {
        await this.client.close().then(function () { console.log('Database Disconnected') }).catch(function (error) { reject(error) });
    }

    async insertLotsDetail(data) {
        const carparkAvailability = this.database.collection("carparkAvailability");
        await carparkAvailability.deleteMany({}).then(function () { console.log('Deleted Many in carparkAvailability') }).catch(function (error) { reject(error) });
        await carparkAvailability.insertMany(data).then(function () { console.log('Inserted Many in carparkAvailability') }).catch(function (error) { reject(error) });
    }

    async updateCarparkInfo() {
        const hdbCarparkInformation = this.database.collection("hdbCarparkInformation");
        const hdbCarparkLotsInformation = this.database.collection("hdbCarparkLotsInformation");

        return new Promise(async function (resolve, reject) {
            await hdbCarparkInformation.aggregate([
                {
                    $lookup: {
                        from: 'carparkAvailability',
                        localField: 'car_park_no',
                        foreignField: 'car_park_no',
                        as: 'car_park_availability'
                    }
                },
                {
                    $project: {
                        car_park_no: 1,
                        address: 1,
                        location: 1,
                        car_park_type: 1,
                        type_of_parking_system: 1,
                        short_term_parking: 1,
                        free_parking: 1,
                        night_parking: 1,
                        car_park_decks: 1,
                        gantry_height: 1,
                        car_park_basement: 1,
                        car_park_lot: {
                            $reduce: {
                                input: "$car_park_availability.carpark_info",
                                initialValue: "",
                                in: { $concatArrays: "$$this" }
                            }
                        },
                        update_datetime: {
                            $reduce: {
                                input: "$car_park_availability.update_datetime",
                                initialValue: "",
                                in: { $concat: ["$$value", "$$this"] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        car_park_no: 1,
                        address: 1,
                        location: 1,
                        car_park_type: 1,
                        type_of_parking_system: 1,
                        short_term_parking: 1,
                        free_parking: 1,
                        night_parking: 1,
                        car_park_decks: 1,
                        gantry_height: 1,
                        car_park_basement: 1,
                        car_park_lot: 1,
                        update_datetime: {
                            $dateFromString: {
                                dateString: "$update_datetime",
                                onError: "",
                                onNull: ""
                            }
                        }
                    }
                }
            ]).toArray(async function (err, res) {
                if (err)
                    throw err;
                await hdbCarparkLotsInformation.deleteMany({}).then(function () { console.log('Deleted Many in hdbCarparkLotsInformation') }).catch(function (error) { reject(error) });
                await hdbCarparkLotsInformation.insertMany(res).then(function () { console.log('Inserted Many in hdbCarparkLotsInformation') }).catch(function (error) { reject(error) });

                resolve();
            })
        });
    }

    async deleteOld() {
        const hdbCarparkLotsInformation = this.database.collection("hdbCarparkLotsInformation");
        const query = {
            $or: [
                {
                    update_datetime:
                    {
                        "$lte": new Date((new Date().getTime() - (24 * 60 * 60 * 1000)))
                    }
                },
                {
                    update_datetime: ""
                }
            ]
        }

        const result = await hdbCarparkLotsInformation.deleteMany(query).catch(function (error) { reject(error) });
        console.log("Deleted " + result.deletedCount + " documents");
    }
}

module.exports = databaseMgt;