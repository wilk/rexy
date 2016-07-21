import Rexy from '../index'

(async function () {
    try {
        let rexy = new Rexy()

        let res = await rexy.post({test: 'lool'})
        console.log(res)
        res = await rexy.get(res.id)
        console.log(res)
        res = await rexy.put(res.id, {test: 'ghgh', asd: 'hey!'})
        console.log(res)
        res = await rexy.get()
        console.log(res)
        await rexy.delete(res[0].id)
    }
    catch (err) {
        console.error(err);
    }
})()