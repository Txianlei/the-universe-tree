addLayer("g", {
    name: "genesis", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "genesis", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new Decimal(0.5)
        if (player.g.points.gte(1e8) || hasUpgrade("g",35)) exp = exp.add(-0.25)
        if (hasUpgrade("p",45)) exp = exp.add(0.02)
        if (inChallenge("p",12)) exp = exp.div(30)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("g",22)) mult = mult.times(2)
        if (hasUpgrade("g",24)) mult = mult.times(upgradeEffect("g",24))
        if (hasUpgrade("g",31)) mult = mult.times(upgradeEffect("g",31))
        if (hasUpgrade("g",34)) mult = mult.times(3)
        if (hasUpgrade("q",13)) mult = mult.times(upgradeEffect("q",13))
        if (hasUpgrade("q",34)) mult = mult.times(upgradeEffect("q",34))
        if (hasUpgrade("q",54)) mult = mult.times(upgradeEffect("q",54))
        if (hasUpgrade("p",12)) mult = mult.times(5)
        if (player.q.unlocked) mult = mult.times((tmp.q.powerEffofd).add(1).times(0.5))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new Decimal(1)
        if (hasUpgrade("q",65)) pow = pow.times(1.1)
        if (hasUpgrade("p",25)) pow = pow.times(1.05)
        return pow
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset for genesis", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        let keep = [tmp.g.upgrades[35]];
        if (hasMilestone("q",1) && resettingLayer=="q" || hasMilestone("p",1)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("g", keep)
    },
    layerShown(){return true},
    tabFormat: ["main-display",
    "prestige-button",
    "blank",
    ["display-text",
        function() {return player.g.points.gte(1e8) ? 'Genesis gain is less after 1e8 genesis!' : ""},
            {}],
    "blank",
     "upgrades"],
    passiveGeneration() {
        let rate = 0
        if (hasMilestone("q",0)) rate = 1
        if (hasMilestone("p",2)) rate = 10

        if (inChallenge("p",11)) rate = -0.1
        return rate 
    },
    upgrades:{
        rows:12,
        cols:5,
        11:{
            title:"The beginning of everything",
            description(){return "Add 0.1 to point generation."},
            cost(){return new Decimal(1)},
            unlocked(){ 
                return player.g.unlocked
            }
        },
        12:{
            title:"Boosting",
            description(){return "Add 0.02 to point generation."},
            cost(){return new Decimal(1)},
            unlocked(){
                return hasUpgrade("g",11)
            }
        },
        13:{
            title:"Breaking",
            description(){return "Add 0.05 to point generation."},
            cost(){return new Decimal(1)},
            unlocked(){
                return hasUpgrade("g",12)
            }
        },
        14:{
            title:"Changing",
            description(){return "Add a number to point generation based on your genesis."},
            cost(){return new Decimal(2)},
            unlocked(){
                return hasUpgrade("g",13)
            },
            effect(){return hasUpgrade("q",43) ? player.g.points.add(10).log10().pow(4).div(hasUpgrade("g",15) ? 50 : 100):player.g.points.add(10).log10().pow(4).div(hasUpgrade("g",15) ? 50 : 100).min(1000)},
            effectDisplay(){return `+${format(upgradeEffect("g",14))}`}
        },
        15:{
            title:"Major boost of this row I",
            description(){return "Double the effect of \"changing\"."},
            cost(){return new Decimal(5)},
            unlocked(){
                return hasUpgrade("g",14)
            },
        },
        21:{
            title:"Gathering",
            description(){return "Double the point generation."},
            cost(){return new Decimal(12)},
            unlocked(){
                return hasUpgrade("g",15)
            },
        },
        22:{
            title:"Charging",
            description(){return "Double genesis gain."},
            cost(){return new Decimal(20)},
            unlocked(){
                return hasUpgrade("g",21)
            },
        },
        23:{
            title:"Waiting",
            description(){return "Boost point generation based on points."},
            cost(){return new Decimal(30)},
            unlocked(){
                return hasUpgrade("g",22)
            },
            effect(){return player.points.add(1).log10().pow(3).pow(2).div(hasUpgrade("p",35) ? 1 : hasUpgrade("g",25) ? 35:100).add(1).min(hasUpgrade("q",23) ? new Decimal(1000).times(upgradeEffect("q",23)) : 1000)},
            effectDisplay(){return `x${format(upgradeEffect("g",23))}`}
        },
        24:{
            title:"Low energy level",
            description(){return "Boost genesis gain based on your points."},
            cost(){return new Decimal(45)},
            unlocked(){
                return hasUpgrade("g",23)
            },
            effect(){return player.points.add(1).log10().pow(hasUpgrade("g",25)? 4:3.3).pow(2.3).div(145).add(1).min(hasUpgrade("q",24) ? new Decimal(1000).times(upgradeEffect("q",24)) : 1000)},
            effectDisplay(){return `x${format(upgradeEffect("g",24))}`}
        },
        25:{
            title:"Major boost of this row II",
            description(){return "The effect of \"Waiting\" and \"Low energy level\" are better."},
            cost(){return new Decimal(50)},
            unlocked(){
                return hasUpgrade("g",24)
            },
        },
        31:{
            title:"Mid energy level",
            description(){return "Boost genesis gain based on your genesis."},
            cost(){return new Decimal(75)},
            unlocked(){
                return hasUpgrade("g",25)
            },
            effect(){return hasUpgrade("q",44) ? player.g.points.add(1).log10().pow(4 ).div(50).add(1) : player.g.points.add(1).log10().pow(4 ).div(50).add(1).min(1000)},
            effectDisplay(){return `x${format(upgradeEffect("g",31))}`}
        },
        32:{
            title:"High energy level",
            description(){return "Boost point gain based on \"Changing\"'s effect."},
            cost(){return new Decimal(15000)},
            unlocked(){
                return hasUpgrade("g",31)
            },
            effect(){return hasUpgrade("q",63) ? upgradeEffect("g",14).pow(5).add(1).ln().pow(2.5).add(1).min(1000) : upgradeEffect("g",14).times(5).add(1).pow(0.25).min(1000)},
            effectDisplay(){return `x${format(upgradeEffect("g",32))}`}
        },
        33:{
            title:"Unreachable energy level",
            description(){return "Triple point gain."},
            cost(){return new Decimal(3e7)},
            unlocked(){
                return hasUpgrade("g",32)
            },
        },
        34:{
            title:"True vaccum",
            description(){return "Triple genesis gain."},
            cost(){return new Decimal(1.1e8)},
            unlocked(){
                return hasUpgrade("g",33)
            },
        },
        35:{
            title:"Big bang",
            description(){return "The cost scaling of genesis start from 0 but unlock Quark."},
            cost(){return new Decimal(4e9)},
            unlocked(){
                return hasUpgrade("g",34)
            },
        },
    }
}),
addLayer("q", {
    name: "quark", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        upquark: new Decimal(0),
        downquark: new Decimal(0),
        strange: new Decimal(0),
        charm: new Decimal(0),
        top: new Decimal(0),
        bottom: new Decimal(0),
    }},
    color: "#C24545",
    requires: new Decimal(1e9), // Can be a function that takes requirement increases into account
    resource: "quark", // Name of prestige currency
    baseResource: "genesis", // Name of resource prestige is based on
    baseAmount() {return player.g.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new Decimal(0.15)
        if (hasUpgrade("p",45)) exp = exp.add(0.02)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("q",14)) mult = mult.times(2)
        if (hasUpgrade("q",22)) mult = mult.times(upgradeEffect("q",22))
        if (hasUpgrade("q",31)) mult = mult.times(tmp.q.powerEffofcharm)
        if (hasUpgrade("q",42)) mult = mult.times(upgradeEffect("q",42))
        if (hasUpgrade("q",53)) mult = mult.times(upgradeEffect("q",53))
        if (hasUpgrade("p",43)) mult = mult.times(upgradeEffect("p",43))
        if (hasUpgrade("p",13)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    update(diff) {
        if (player.q.unlocked) player.q.upquark = player.q.upquark.plus(tmp.q.effectofup.times(diff));
        if (player.q.unlocked) player.q.downquark = player.q.downquark.plus(tmp.q.effectofdown.times(diff));
        if (hasUpgrade("q",21)) player.q.strange = player.q.strange.plus(tmp.q.effectofstr.times(diff));
        if (hasUpgrade("q",31)) player.q.charm = player.q.charm.plus(tmp.q.effectofcharm.times(diff));
        if (hasUpgrade("q",51)) player.q.top = player.q.top.plus(tmp.q.effectoftop.times(diff));
        if (hasUpgrade("q",51)) player.q.bottom = player.q.bottom.plus(tmp.q.effectofbottom.times(diff));
    },
    hotkeys: [
        {key: "q", description: "Q: Reset for quark", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return hasMilestone("p",0)  },
    effBase() {
        let base = new Decimal(0.6);
        if (hasUpgrade("q",52)) base = base.add(0.15)
        if (hasUpgrade("p",14)) base = base.add(0.12)
        return base;
    },
    effectofup() {
        if (!player.q.unlocked) return new Decimal(0);
        let eff = Decimal.pow(player.q.points,this.effBase()).max(0);
        if (hasUpgrade("q",11)) eff = eff.times(2)
        if (hasUpgrade("q",15)) eff = eff.times(upgradeEffect("q",15))
        if (hasUpgrade("p",22)) eff = eff.times(upgradeEffect("p",22))
        if (hasUpgrade("q",51)) eff = eff.times(tmp.q.powerEffoftop)
        return eff;
    },
    effectofdown() {
        if (!player.q.unlocked) return new Decimal(0);
        let eff = Decimal.pow(player.q.points,this.effBase()).max(0);
        if (hasUpgrade("q",12)) eff = eff.times(2)
        if (hasUpgrade("q",15)) eff = eff.times(upgradeEffect("q",15))
        if (hasUpgrade("q",51)) eff = eff.times(tmp.q.powerEffoftop)
        return eff;
    },
    effectofstr() {
        if (!hasUpgrade("q",21)) return new Decimal(0);
        let eff = Decimal.pow(player.q.upquark,this.effBase()).pow(0.3).max(0);
        if (hasUpgrade("q",35)) eff = eff.times(upgradeEffect("q",35))
        if (hasUpgrade("p",44)) eff = eff.times(upgradeEffect("p",44))
        if (hasUpgrade("q",51)) eff = eff.times(tmp.q.powerEffoftop)
        return eff;
    },
    effectofcharm() {
        if (!hasUpgrade("q",31)) return new Decimal(0);
        let eff = Decimal.pow(player.q.downquark,this.effBase()).pow(0.45).max(0);
        if (hasUpgrade("q",35)) eff = eff.times(upgradeEffect("q",35))
        if (hasUpgrade("q",51)) eff = eff.times(tmp.q.powerEffoftop)
        return eff;
    },
    effectoftop() {
        if (!hasUpgrade("q",51)) return new Decimal(0);
        let eff = Decimal.pow(player.q.strange,this.effBase()).add(1).log10().pow(4).times(10).div(tmp.q.powerEffofbottom);
        if (hasUpgrade("q",64)) eff = eff.times(upgradeEffect("q",64))
        if (hasUpgrade("p",23)) eff = eff.times(upgradeEffect("p",23))
        return eff;
    },
    effectofbottom() {
        if (!hasUpgrade("q",51)) return new Decimal(0);
        let eff = Decimal.pow(player.q.charm,this.effBase()).add(1).log10().pow(3).times(15).div(tmp.q.powerEffoftop);
        if (hasUpgrade("q",64)) eff = eff.times(upgradeEffect("q",64))
        return eff;
    },
    powerExp() {
        let exp = new Decimal(1/6);
        if (hasUpgrade("q",32)) exp = exp.add(1/13)
        if (hasUpgrade("p",32)) exp = exp.add(1/10)
        return exp;
    },
    powerEffofu() {
        if (!player.q.unlocked && player.q.upquark.gt(0) || inChallenge("p",21)) return new Decimal(1);
        let pow = player.q.upquark.add(1).pow(this.powerExp());
        if (hasUpgrade("q",51)) pow = pow.times(tmp.q.powerEffofbottom)
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        if (hasUpgrade("q",25)) pow = pow.times(tmp.q.powerEffofstr);
        return pow
    },
    powerEffofd() {
        if (!player.q.unlocked && player.q.upquark.gt(0) || inChallenge("p",21)) return new Decimal(1);
        let pow = player.q.downquark.add(1).pow(this.powerExp());
        if (hasUpgrade("q",25)) pow = pow.times(tmp.q.powerEffofstr);
        if (hasUpgrade("q",51)) pow = pow.times(tmp.q.powerEffofbottom)
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        return pow
    },
    powerEffofstr() {
        if (!hasUpgrade("q",21) && player.q.strange.gt(0)) return new Decimal(1);
        let pow =  player.q.strange.add(1).ln().pow(this.powerExp()).pow(8).add(1);
        if (hasUpgrade("q",51)) pow = pow.times(tmp.q.powerEffofbottom)
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        return pow
    },
    powerEffofcharm() {
        if (!hasUpgrade("q",31)) return new Decimal(1);
        let pow = Decimal.pow(player.q.charm,this.effBase()).pow(0.25).max(1);
        if (hasUpgrade("q",51)) pow = pow.times(tmp.q.powerEffofbottom)
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        return pow;
    },
    powerEffofbottom() {
        if (!hasUpgrade("q",31) && player.q.top.gt(0)) return new Decimal(1);
        let pow = player.q.bottom.add(1).ln().add(1).pow(this.powerExp());
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        return pow
    },
    powerEffoftop() {
        if (!player.q.unlocked && player.q.bottom.gt(0)) return new Decimal(1);
        let pow = player.q.top.add(1).ln().add(1).pow(this.powerExp());
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        return pow
    },
    branches:["g"],
    layerShown(){return hasUpgrade("g",35) || player.q.unlocked},
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("p",3)) {
            keep.push("upgrades")
            keep.push("milestones")
        }
        if (layers[resettingLayer].row > this.row) layerDataReset("q", keep)
    },
    passiveGeneration() {return hasMilestone("p",2) ? 1 : hasMilestone("q",2)? 0.5: 0},
    tabFormat: ["main-display",
    "prestige-button",
    ["display-text",
    function() {return 'You have ' + format(player.q.upquark) + ' upquark, which boost your point generation by '+format(tmp.q.powerEffofu)+"("+format(tmp.q.effectofup)+"/s)"},
        {}],
    "blank",
    ["display-text",
    function() {return 'You have ' + format(player.q.downquark) + ' downquark, which boost your genesis gain by '+(format(tmp.q.powerEffofd.add(1).times(0.5)))+"("+format(tmp.q.effectofdown)+"/s)"},
        {}],
    "blank",
    ["display-text",
        function() {return hasUpgrade("q",21) ? 'You have ' + format(player.q.strange) + ' strangequark, which boost your upquark effect by '+(format(tmp.q.powerEffofstr))+"("+format(tmp.q.effectofstr)+"/s)" : ""},
        {}],
    "blank",
    ["display-text",
    function() {return hasUpgrade("q",31) ? 'You have ' + format(player.q.charm) + ' charmquark, which boost your quark gain by '+(format(tmp.q.powerEffofcharm))+"("+format(tmp.q.effectofcharm)+"/s)" : ""},
        {}],
    "blank",
    ["display-text",
    function() {return hasUpgrade("q",51) ? 'You have ' + format(player.q.top) + ' topquark, which boost 4 types of quark gain and divide bottom quark gain by '+(format(tmp.q.powerEffoftop))+"("+format(tmp.q.effectoftop)+"/s)" : ""},
        {}],
    "blank",
    ["display-text",
    function() {return hasUpgrade("q",51) ? 'You have ' + format(player.q.bottom) + ' bottomquark, which boost 4 types of quark effect and divide top quark gain by '+(format(tmp.q.powerEffofbottom))+"("+format(tmp.q.effectofbottom)+"/s)" : ""},
        {}],
    "blank",
    "milestones",
    "upgrades"],
    milestones:{
        0: {
            requirementDescription: "3 quarks",
            effectDescription: "Auto generate genesis.",
            done() { return player.q.points.gte(3) }
        },
        1: {
            requirementDescription: "5 quarks and genesis upgrade \"big bang\"",
            effectDescription: "Keep genesis upgrades on quark reset.",
            done() { return player.q.points.gte(5) && hasUpgrade("g",35) }
        },
        2: {
            requirementDescription: "10 quarks",
            effectDescription: "Auto generate quark.",
            done() { return player.q.points.gte(10) }
        },
    },
    upgrades:{
        rows:12,
        cols:5,
        11:{
            title:"Quark delay",
            description(){return "Double upquark gain.(needs \"bigbang\")"},
            cost(){return new Decimal(1)},
            unlocked(){
                return player.q.unlocked && hasUpgrade("g",35)
            }
        },
        12:{
            title:"Quark exist",
            description(){return "Double downquark gain.(needs \"bigbang\")"},
            cost(){return new Decimal(1)},
            unlocked(){
                return player.q.unlocked && hasUpgrade("g",35)
            }
        },
        13:{
            title:"Quark boost",
            description(){return "Boost genesis gain based on quark."},
            cost(){return new Decimal(2)},
            unlocked(){
                return hasUpgrade("q",11) && hasUpgrade("q",12)
            },
            effect(){return player.q.points.add(1).ln().pow(3).div(20).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",13))}`}
        },
        14:{
            title:"Quark enhance",
            description(){return "Double quark gain."},
            cost(){return new Decimal(5)},
            unlocked(){
                return hasUpgrade("q",13)
            },
        },
        15:{
            title:"Major boost of this row III",
            description(){return "boost upquark and downquark based on themselves."},
            cost(){return new Decimal(10)},
            unlocked(){
                return hasUpgrade("q",14)
            },
            effect(){return hasUpgrade("q",44) ? player.q.upquark.times(player.q.downquark).add(1).ln().pow(2.5).div(50).add(1) : player.q.upquark.add(player.q.downquark).add(1).log10().pow(4).div(75).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",15))}`}
        },
        21:{
            title:"Starnge ones",
            description(){return "Unlock a new type of quark."},
            cost(){return new Decimal(20)},
            unlocked(){
                return hasUpgrade("q",15)
            },
        },
        22:{
            title:"Strange boost",
            description(){return "Points boost quark gain."},
            cost(){return new Decimal(20)},
            unlocked(){
                return hasUpgrade("q",21)
            },
            effect(){return player.points.add(1).log10().div(2).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",22))}`}
        },
        23:{
            title:"Strange cross",
            description(){return "downquark delays the hardcap of \"waiting\"."},
            cost(){return new Decimal(150)},
            unlocked(){
                return hasUpgrade("q",22)
            },
            effect(){return hasUpgrade("q",43) ? player.q.downquark.add(1).pow(4).ln().times(3).add(1):player.q.downquark.pow(0.4).div(100).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",23))}`}
        },
        24:{
            title:"Strange duocross",
            description(){return "strangequark delays the hardcap of \"low energy level\"."},
            cost(){return new Decimal(150)},
            unlocked(){
                return hasUpgrade("q",22)
            },
            effect(){return player.q.strange.pow(0.3).div(20).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",24))}`}
        },
        25:{
            title:"Major boost of this row IV",
            description(){return "strangequark boost downquark's effect."},
            cost(){return new Decimal(300)},
            unlocked(){
                return hasUpgrade("q",24)
            },
        },
        31:{
            title:"Charmful time",
            description(){return "Unlock a new type of quark."},
            cost(){return new Decimal(500)},
            unlocked(){
                return hasUpgrade("q",25)
            },
        },
        32:{
            title:"Charmful boost",
            description(){return "Increase boosts of 4 kinds of quarks."},
            cost(){return new Decimal(4000)},
            unlocked(){
                return hasUpgrade("q",31)
            },
        },
        33:{
            title:"Charmful delay",
            description(){return "4 quarks boost point generation."},
            cost(){return new Decimal(20000)},
            unlocked(){
                return hasUpgrade("q",32)
            },
            effect(){return hasUpgrade("q",43) ? player.q.downquark.times(player.q.upquark).times(player.q.strange).add(1).log10().times(player.q.charm).add(1).log10().times(player.q.charm).pow(0.35).add(1) : player.q.downquark.add(player.q.upquark).times(player.q.strange).add(1).log10().pow(player.q.charm).add(1).log10().div(300).pow(0.2).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",33))}`}
        },
        34:{
            title:"Charmful part",
            description(){return "4 quarks boost genesis gain."},
            cost(){return new Decimal(50000)},
            unlocked(){
                return hasUpgrade("q",33)
            },
            effect(){return player.q.downquark.add(player.q.upquark).times(player.q.strange).add(1).ln().pow(player.q.charm).add(1).log10().div(300).pow(0.15).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",34))}`}
        },
        35:{
            title:"Major boost of this row V",
            description(){return"boost strange quark and charm quark based on themselves."},
            unlocked(){
                return hasUpgrade("q",34)
            },
            cost(){return new Decimal(100000)},
            effect(){return hasUpgrade("q",44) ? player.q.strange.times(player.q.charm).pow(2).add(1).ln().pow(2.5).div(50).max(1) : player.q.strange.times(player.q.charm).add(1).ln().pow(3).div(500).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",35))}`}
        },
        41:{
            title:"A break of quarks",
            description(){return "Point generation is raised to ^1.15"},
            unlocked(){
                return hasUpgrade("q",35)
            },
            cost(){return new Decimal(120000)},
        },
        42:{
            title:"Quark protection",
            description(){return "Boost quark gain based on your genesis."},
            unlocked(){
                return hasUpgrade("q",41)
            },
            cost(){return new Decimal(200000)},
            effect(){return hasUpgrade("q",45) ? player.g.points.add(1).ln().pow(2).div(115).max(1) : player.g.points.add(1).log10().pow(2.5).div(215).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",42))}`}
        },
        43:{
            title:"Quark quark",
            description(){return "The effect formulas of \"charmful delay\",\"strange cross\"is better and remove the hardcap of \"changing\"."},
            unlocked(){
                return hasUpgrade("q",42)
            },
            cost(){return new Decimal(2000000)},
        },
        44:{
            title:"Quark power",
            description(){return "The effect formulas of \"Major boost III\",\"Major boost V\"is better and remove the hardcap of \"mid energy level\"."},
            unlocked(){
                return hasUpgrade("q",43)
            },
            cost(){return new Decimal(5000000)},
        },
        45:{
            title:"Major boost of this row VI",
            description(){return "\"Quark protection\"'s formula is better."},
            unlocked(){
                return hasUpgrade("q",44)
            },
            cost(){return new Decimal(1e7)},
        },
        51:{
            title:"Quark family",
            description(){return "Unlock last 2 types of quark."},
            unlocked(){
                return hasUpgrade("q",45)
            },
            cost(){return new Decimal(1e7)},
        },
        52:{
            title:"Quark being",
            description(){return "Increase the production of 6 types of quarks."},
            unlocked(){
                return hasUpgrade("q",51)
            },
            cost(){return new Decimal(1e8)},
        },
        53:{
            title:"Quark antiboost",
            description(){return "Boost quark gain based on your 6 types of quark."},
            unlocked(){
                return hasUpgrade("q",52)
            },
            cost(){return new Decimal(3e8)},
            effect(){return player.q.upquark.times(player.q.downquark).pow(player.q.charm.times(player.q.strange).pow(0.2).add(1).log10()).add(1).log10().pow(player.q.top.times(player.q.bottom).add(1).log10().add(1).log10()).pow(0.65).times(hasUpgrade("q",61) ? upgradeEffect("q",61) : 1).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",53))}`}
        },
        54:{
            title:"Quark antiboost+",
            description(){return "Boost genesis gain based on your 6 types of quark."},
            unlocked(){
                return hasUpgrade("q",53)
            },
            cost(){return new Decimal(1e10)},
            effect(){return player.q.upquark.times(player.q.downquark.pow(1.2)).pow(player.q.charm.times(player.q.strange).pow(0.45).add(1).log10()).add(1).log10().pow(player.q.top.pow(player.q.bottom).add(1).log10().add(1).log10()).pow(0.6).add(1).ln().pow(1.5).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",54))}`}
        },
        55:{
            title:"Quark antiboost++",
            description(){return "Boost point generation based on your 6 types of quark."},
            unlocked(){
                return hasUpgrade("q",54)
            },
            cost(){return new Decimal(5e10)},
            effect(){return player.q.upquark.pow(player.q.downquark.add(1).ln()).times(player.q.charm.times(player.q.strange).pow(2).add(1).log10()).add(1).log10().pow(player.q.top.pow(player.q.bottom).add(1).ln().add(1).log10()).pow(0.3).add(1).ln().pow(1.3).times(hasUpgrade("q",62) ? upgradeEffect("q",62) : 1).add(1).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",55))}`}
        },
        61:{
            title:"Quark antiboost+++",
            description(){return "Boost \"quark antiboost\" based on your \"quark antiboost+\"."},
            unlocked(){
                return hasUpgrade("q",55)
            },
            cost(){return new Decimal(2e11)},
            effect(){return upgradeEffect("q",54).pow(2).add(1).log10()},
            effectDisplay(){return `x${format(upgradeEffect("q",61))}`}
        },
        62:{
            title:"Quark antiboost++++",
            description(){return "Boost \"quark antiboost++\" based on your \"quark antiboost+\"."},
            unlocked(){
                return hasUpgrade("q",61)
            },
            cost(){return new Decimal(1e12)},
            effect(){return upgradeEffect("q",54).pow(2).add(1).ln().pow(0.6).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",62))}`}
        },
        63:{
            title:"Quark antiboost+5",
            description(){return "THe formula of \"high energy level\" is better."},
            unlocked(){
                return hasUpgrade("q",62)
            },
            cost(){return new Decimal(1e13)},
        },
        64:{
            title:"Quark antiboost+n",
            description(){return "Top quark and bottom quark boost each other."},
            unlocked(){
                return hasUpgrade("q",63)
            },
            cost(){return new Decimal(2e13)},
            effect(){return player.q.top.pow(player.q.bottom).add(1).log10().add(1).ln().pow(2).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",64))}`}
        },
        65:{
            title:"Truth of quarks",
            description(){return "Unlock proton, genesis gain is raised to ^1.1"},
            unlocked(){
                return hasUpgrade("q",63)
            },
            cost(){return new Decimal(4e13)},
        },
    }
}),
addLayer("p", {
    name: "proton", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#1111EF",
    requires: new Decimal(1e14), // Can be a function that takes requirement increases into account
    resource: "proton", // Name of prestige currency
    baseResource: "quark", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new Decimal(0.142857)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p",15)) mult = mult.times(2)
        if (hasUpgrade("p",31)) mult = mult.times(2)
        if (hasUpgrade("p",41)) mult = mult.times(upgradeEffect("p",41))
        if (hasUpgrade("p",42)) mult = mult.times(upgradeEffect("p",42))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new Decimal(1)
        return pow
    },
    passiveGeneration() {return hasChallenge("p",21) ? 0.2 : 0},
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for proton", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("q",65)||player.p.unlocked},
    tabFormat: ["main-display",
    "prestige-button",
    "milestones",
    "blank",
    "upgrades",
    "blank",
    "challenges"],
    branches:["q"],
    milestones:{
        0: {
            requirementDescription: "1 proton",
            effectDescription: "quark resets nothing.",
            done() { return player.p.points.gte(1) }
        },
        1: {
            requirementDescription: "2 proton",
            effectDescription: "Keep genesis upgrades on all resets.",
            done() { return player.p.points.gte(2) }
        },
        2: {
            requirementDescription: "3 proton",
            effectDescription: "Increase the speed of genesis generation and quark generation.",
            done() { return player.p.points.gte(3) }
        },
        3: {
            requirementDescription: "4 proton",
            effectDescription: "Keep quark upgrades and milestones on all resets. Unlock a proton challenge.",
            done() { return player.p.points.gte(4) }
        },
    },
    upgrades:{
        11:{
            title:"Second structure",
            description(){return "10x point gain."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        12:{
            title:"Third structure",
            description(){return "5x genesis gain."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        13:{
            title:"Fourth structure",
            description(){return "Double quark gain."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        14:{
            title:"Fifth structure",
            description(){return "Increase the production of 6 types of quarks."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        15:{
            title:"Sixth structure",
            description(){return "Double proton gain."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        21:{
            title:"Proton boost",
            description(){return "Boost point generation based on your proton."},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(2)},
            effect(){return new Decimal(hasUpgrade("p",33) ? 3 : 2).pow(player.p.points).pow(0.25).max(1).min(1e10)},
            effectDisplay(){return `x${format(upgradeEffect("p",21))}`}
        },
        22:{
            title:"Proton boost II",
            description(){return "Boost upquark generation based on your proton."},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(2)},
            effect(){return new Decimal(10).times(player.p.points).add(1).ln().pow(1.5).max(1).min(1e10)},
            effectDisplay(){return `x${format(upgradeEffect("p",22))}`}
        },     
        23:{
            title:"Proton boost III",
            description(){return "Boost topquark generation based on your proton."},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(4)},
            effect(){return new Decimal(7).pow(player.p.points).add(1).ln().pow(0.5).max(1).min(1e10)},
            effectDisplay(){return `x${format(upgradeEffect("p",23))}`}
        },
        24:{
            title:"Proton boost IV",
            description(){return "Boost all quark's effect based on your proton."},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(6)},
            effect(){return player.p.points.pow(10).pow(10).add(1).log10().pow(0.3).max(1).min(1e15)},
            effectDisplay(){return `x${format(upgradeEffect("p",24))}`}
        },
        25:{
            title:"Proton boost V",
            description(){return "Point generation is raised to ^1.05 "},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(10)},
        },
        31:{
            title:"Proton boost VI",
            description(){return "Double proton gain."},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        32:{
            title:"Proton boost VII",
            description(){return "Increase the effect of 6 types of quarks."},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        33:{
            title:"Proton boost VIII",
            description(){return "\"Proton boost\"'s base is 3"},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        34:{
            title:"Proton boost IX",
            description(){return "Point gain is raised to ^1.1"},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        35:{
            title:"Proton boost X",
            description(){return "remove the divisor of \"waiting\"."},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        41:{
            title:"Proton boost XI",
            description(){return "Boost proton gain based on you points."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(1000)},
            effect(){return player.points.pow(5).add(1).log10().pow(0.2).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",41))}`}
        },
        42:{
            title:"Proton boost XII",
            description(){return "Boost proton gain based on you bottomquark."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(1000)},
            effect(){return player.q.bottom.add(1).log10().pow(0.35).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",42))}`}
        },
        43:{
            title:"Proton boost XIII",
            description(){return "Boost quark gain based on \"Quark boost +++\"'s effect."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(1000)},
            effect(){return upgradeEffect("q",61).pow(2).div(6).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",43))}`}
        },
        44:{
            title:"Proton boost XIV",
            description(){return "Boost strangequark gain based on your proton"},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(1000)},
            effect(){return player.p.points.pow(0.3).add(1).log10().pow(1.2).times(2).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",44))}`}
        },
        45:{
            title:"Proton boost XV",
            description(){return "Increase genesis and quark gain base."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(1000)},
        },
    },
    challenges:{
        11: {
            name: "No idle",
            challengeDescription: "You lose 10% of your genesis gain on reset every second, genesis generation is disabled.",
            canComplete: function() {return player.points.gte(5e36)},
            goalDescription(){return "5e36 points"},
            rewardDescription(){return "Unlock 5 proton upgrades."},
            unlocked() {
                return hasMilestone("p",3)
            }
        },
        12: {
            name: "Expensive things",
            challengeDescription: "Genesis reqiurement is much increased.",
            canComplete: function() {return player.points.gte(1e43)},
            goalDescription(){return "1e43 points"},
            rewardDescription(){return "Unlock 5 proton upgrades."},
            unlocked() {
                return hasUpgrade("p",21)&&hasUpgrade("p",22)&&hasUpgrade("p",23)&&hasUpgrade("p",24)&&hasUpgrade("p",25)
            }
        },
        21: {
            name: "Unorganize quarks",
            challengeDescription: "Effect of upquark and downquark are disabled.",
            canComplete: function() {return player.points.gte(1e45)},
            goalDescription(){return "1e45 points"},
            rewardDescription(){return "Unlock 5 proton upgrades. Auto generate proton."},
            unlocked() {
                return hasUpgrade("p",31)&&hasUpgrade("p",32)&&hasUpgrade("p",33)&&hasUpgrade("p",34)&&hasUpgrade("p",35)
            }
        },
    }
}),
addLayer("a", {
    startData() { return {
        unlocked: true,
    }},
    color: "yellow",
    row: "side",
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievements: {
        rows: 17,
        cols: 4,
        11: {
            name: "The beginning",
            done() { return player.g.points.gt(0) },
            tooltip: "Perform a Genesis reset.",
        },
        12: {
            name: "Meanless upgrades",
            done() { return hasUpgrade("g",15) },
            tooltip: "Purchase the \"Major boost in this row I\"",
        },
        13: {
            name: "Boring to Boring",
            done() { return hasUpgrade("g",25) },
            tooltip: "Purchase the \"Major boost in this row II\"",
        },
        14: {
            name: "Big bang",
            done() { return hasUpgrade("g",35) },
            tooltip: "Purchase the \"Big bang\"",
        },
        21: {
            name: "The story just begins",
            done() { return player.q.points.gt(0) },
            tooltip: "Perform a Quark reset.",
        },
        22: {
            name: "No,you must buy it",
            done() { return hasMilestone("q",1) },
            tooltip: "Get all quark milestones",
        },
        23: {
            name: "up to up",
            done() { return player.q.upquark.gte(1e11) },
            tooltip: "Get 1e11 upquark.",
        },
        24: {
            name: "Three by one and two",
            done() { return hasUpgrade("q",65) },
            tooltip: "Purchase all quark upgrades.",
        },
    update(diff) {	// Added this section to call adjustNotificationTime every tick, to reduce notification timers
        adjustNotificationTime(diff);
    },
    },
    tabFormat: [
        "blank", 
        ["display-text", function() { return "Achievements: "+player.a.achievements.length+"/8" }], 
        "blank", "blank",
        "achievements",
    ],
})

