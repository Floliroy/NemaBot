/**
 * Libraries
 */
const Logger = require('./discordLogger')

/**
 * This method will randomize the order of the array
 */
Array.prototype.shuffle = function(){
    for(let i=this.length-1 ; i>0 ; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        let temp = this[i]
        this[i] = this[j]
        this[j] = temp
    }
}

/**
 * This method organize an array depending on the elo
 */
Array.prototype.orderByTier = function(){
    const ranks = new Array("Challenger", "Grandmaster", "Master", "Diamond", "Platinum", "Gold", "Silver", "Bronze", "Iron", "Unranked")
    let ordered = new Array()

    this.shuffle()
    for(let rank of ranks){
        for(let row of this){
            if(row["Elo"] == rank){
                ordered.push(row)
            }
        }
    }
    return ordered
}

/**
 * This method organize an array depending on the score
 */
Array.prototype.orderByScore = function(){
    this.shuffle()
    this.sort(function(a, b){
        return b["Score"] - a["Score"]
    })
}

module.exports = class GeneratePools{

    static async generateInit(doc){
        const sheetPools = doc.sheetsById["1482599715"]
        await sheetPools.loadCells()

        const sheetPlayers = doc.sheetsById["0"]
        const rows = await sheetPlayers.getRows()
        const players = rows.orderByTier()

        const nbPools = Math.floor(players.length / 8) + (players.length % 8 == 0 ? 0 : 1)
        let pool = 0
        let line = 0
        for(let player of players){
            const cell = sheetPools.getCell(
                5 + 10 * Math.floor((pool) / 5) + line,
                1 + ((pool) % 5) * 2
            )
            
            cell.value = player["Nom Invocateur"]

            pool = (pool + 1) % nbPools
            if(pool == 0) line++
        }
        sheetPools.getCell(1, 1).value = "Round 1"
        await sheetPools.saveUpdatedCells()
        Logger.log("Generate", "Round initial généré")
    }
    
    static async generateRound(nbRound, doc){
        const sheetPools = doc.sheetsById["1482599715"]
        await sheetPools.loadCells()

        const sheetPlayers = doc.sheetsById["0"]
        const players = await sheetPlayers.getRows()
        players.orderByScore()

        const nbPools = Math.floor(players.length / 8) + (players.length % 8 == 0 ? 0 : 1)
        let pool = 0
        let line = 0
        for(let player of players){
            const cell = sheetPools.getCell(
                5 + 10 * Math.floor((pool) / 5) + line,
                1 + ((pool) % 5) * 2
            )
            cell.value = player["Nom Invocateur"]
            line = (line + 1) % 8 
            if(line == 0) pool = (pool + 1) % nbPools
        }
        
        sheetPools.getCell(1, 1).value = `Round ${nbRound}`
        await sheetPools.saveUpdatedCells()
        Logger.log("Generate", `Round ${nbRound} généré`)
    }

}