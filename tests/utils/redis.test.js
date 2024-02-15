/* eslint-disable */
import { expect } from "chai"
import redisClient from "../../utils/redis"

describe("RedisClient", () => {
    it("isAlive", () => {
        expect(redisClient.isAlive()).to.equal(true)
    })
    it("get", async () => {
        expect(await redisClient.get("myKey")).to.equal(null)
    })
    it("set", async () => {
        expect(await redisClient.set("myKey", "myValue")).to.equal("OK")
    })
    it("del", async () => {
        expect(await redisClient.del("myKey")).to.equal(1)
    })
})