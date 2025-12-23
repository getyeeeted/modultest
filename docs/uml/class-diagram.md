classDiagram
    class GameController {
      -gold: number
      -level: number
      -maxGardenSize: number
      -purchasedUpgrades: Set<string>
      -purchasedGardenUpgrades: Set<string>
      -unlockedAchievements: Set<string>
      -garden: Garden
      -saveProvider: ISaveProvider
      +init()
      +tick(dtSeconds)
      +purchasePlant(plantId)
      +upgradePlant(instanceId)
      +purchaseUpgrade(upgradeId)
      +purchaseGardenUpgrade(upgradeId)
      +sellPlant(instanceId)
      +getPlants()
      +getGPS()
      +getBiome()
      +saveGame()
      +resetGame()
    }

    class Garden {
      -_plants: Plant[]
      +addPlant(plant)
      +removePlant(plantId)
      +getPlants()
      +calculateTotalGPS(globalMultiplier)
      +getPlantById(id)
      +clear()
    }

    class Plant {
      <<abstract>>
      -_id: string
      -_plantId: string
      -_name: string
      -_level: number
      -_baseYield: number
      -_value: number
      +calculateYield(globalMultiplier)
      +upgrade(cost)
      +id
      +plantId
      +name
      +level
      +baseYield
      +value
    }

    class Crop {
      +calculateYield(globalMultiplier)
    }

    class Tree {
      +calculateYield(globalMultiplier)
    }

    class ISaveProvider {
      <<interface>>
      +save(data)
      +load()
      +clear()
    }

    class LocalStorageProvider {
      -KEY: string
      +save(data)
      +load()
      +clear()
    }

    GameController --> Garden : aggregates
    Garden --> Plant : contains *
    Plant <|-- Crop
    Plant <|-- Tree
    GameController --> ISaveProvider : uses
    ISaveProvider <|.. LocalStorageProvider
