GameServer <- R6::R6Class(
    "GameServer",
    public = list(
        initialize = function() {
            self$events <- EventManager$new(broadcast_to_console = FALSE)
            self$players <- EntityList$new() 
            self$cats <- EntityList$new()
            self$start_level()
        },
        
        start_level = function() {
            for(i in seq_len(self$level)) {
                self$add_cat()
            }
            self$events$broadcast(new_event("new-level", list(level = self$level)))
            invisible(self)
        },
        
        join = function() {
            player <- new_player()
            self$players$add(player)
            if (!self$game_is_running) {
                self$start_game()
            }
            self$events$broadcast(new_event("add-player", player))
            
            list(
                player_id = player$id,
                level = self$level,
                players = self$players,
                cats = self$cats
            )
        },
        
        leave = function(player_id) {
            self$players$remove(player_id)
            if (self$players$is_empty()) {
                self$end_game()
            }
            self$events$broadcast(new_event("remove-player", player_id))
            invisible(self)
        },
        
        request_move = function(player_id, direction) {
            player <- self$players$get(player_id)
            if (direction == 1) player$facing = "right"
            if (direction == 3) player$facing = "left"
            positionAfterMove <- getPositionAfterMove(player$x, player$y, direction)
            game_state <- self$get_game_state()
            isFree <- isFreeTile(positionAfterMove$x, positionAfterMove$y, game_state)
            if (isFree) {
                player$x = positionAfterMove$x
                player$y = positionAfterMove$y
                self$players$set(player_id, player)
            }
            self$events$broadcast(
                new_event(
                    "update-player", 
                    list(id = player$id, newData = player[c("x", "y", " facing")])
                )
            )
            self$move_cats()
            invisible(self)
        },
        
        add_cat = function() {
            cat <- new_cat()
            self$cats$add(cat)
            self$events$broadcast(new_event("add-cat", cat))
            return(cat$id)
        },
        
        remove_cat = function(cat_id) {
            if (self$cats$is_empty()) {
                self$end_game() # Players won
                self$level <- self$level + 1L
                self$start_level()
            }
            self$events$broadcast(new_event("remove-cat", cat_id))
        },
        
        move_cats = function() {
            cats <- self$cats$get_all()
            
            purrr::walk(cats, \(cat) {
                game_state <- self$get_game_state()
                nextMove = getNextMove(cat$x, cat$y, cat$lastMove, game_state)
                if (!is.null(nextMove)) {
                    cat$x <- nextMove$positionAfterMove$x
                    cat$y <- nextMove$positionAfterMove$y
                    if (nextMove$move == 1) cat$facing <- "right"
                    if (nextMove$move == 3) cat$facing <- "left"
                    cat$lastMove <- nextMove$move;
                    cat$trapped <- FALSE
                    cat$fuss <- 5L
                } else {
                    # cat trapped -- becomes less fuzzy until 0, then remove cat
                    cat$trapped <- TRUE
                    cat$lastMove <- NULL
                    cat$fuss <- cat$fuss - 1L
                    if (cat$fuss == 0) {
                        # cat is caught. return early
                        self$remove_cat(cat$id)
                        return()
                    }
                }
                self$cats$set(cat$id, cat)
                self$events$broadcast(new_event(
                    "update-cat", 
                    list(id = cat$id, newData = cat[c("x", "y", "facing", "fuss", "trapped")])
                ))
            })
        },
        
        start_game = function() {
            self$game_is_running = TRUE
            #self$run_game_loop()
            invisible(self)
        },
        
        end_game = function() {
            self$game_is_running <- FALSE # will stop the game loop on next iteration
        },
        
        run_game_loop = function() {
            while (self$game_is_running) {
                self$move_cats()
                later::later(self$run_game_loop, 0.5)
            }
        },
        
        get_game_state = function() {
            list(
                cats = self$cats$get_all(),
                players = self$players$get_all()
            )
        },
        
        events = NULL,
        players = NULL,
        cats = NULL,
        level = 1L,
        game_is_running = FALSE
    )
)
