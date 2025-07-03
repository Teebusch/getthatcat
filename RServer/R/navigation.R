mapData <- list(
    minX = 1,
    maxX = 14,
    minY = 4,
    maxY = 12,
    blockedSpaces = c(
        "7x4", "1x11", "12x10", "4x7", "5x7", "6x7",
        "8x6", "9x6", "10x6", "7x9", "8x9", "9x9"
    )
)


getKeyString <- function(x, y) {
    paste0(x, "x", y)
}


getPositionAfterMove <- function(currentX, currentY, move) {
    newX <- currentX
    newY <- currentY
    
    if (move == 0) {
        newY <- newY + 1
    } else if (move == 1) {
        newX <- newX + 1
    } else if (move == 2) {
        newY <- newY - 1
    } else if (move == 3) {
        newX <- newX - 1
    }
    list(x = newX, y = newY)
}


isFreeTile <- function(x, y, gameState) {
    isOnMap <- 
        x >= mapData$minX && 
        x < mapData$maxX &&
        y >= mapData$minY && 
        y < mapData$maxY
    
    positionToCheck <- getKeyString(x, y)
    isBlocked <- positionToCheck %in% mapData$blockedSpaces
    
    players <- gameState$players
    cats <- gameState$cats
    
    isOccupied <- any(sapply(players, \(p) p$x == x && p$y == y)) ||
        any(sapply(cats,    \(p) p$x == x && p$y == y))
    
    isOnMap && !isBlocked && !isOccupied
}


getNextMove <- function(currentX, currentY, lastMove = NULL, gameState) {
    if (is.null(lastMove)) {
        lastMove <- sample(0:3, 1)
    }
    
    randomlyChangeDirection <- if (runif(1) > 0.7) 1 else 0
    start <- (lastMove + randomlyChangeDirection) %% 4
    turnLeft <- runif(1) < 0.5
    
    tryMove <- start
    for (i in 0:3) {
        if (tryMove < 0) tryMove <- 3
        if (tryMove > 3) tryMove <- 0
        
        newPosition <- getPositionAfterMove(currentX, currentY, tryMove)
        if (isFreeTile(newPosition$x, newPosition$y, gameState)) {
            return(list(
                move = tryMove,
                positionAfterMove = newPosition
            ))
        }
        if (turnLeft) {
            tryMove <- tryMove - 1
        } else {
            tryMove <- tryMove + 1
        }
    }
    return(NULL)
}
