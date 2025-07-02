GameServer <- R6::R6Class(
    "GameServer",
    public = list(
        initialize = function() {
            self$events <- EventManager$new(broadcast_to_console = TRUE)
            self$players <- PlayerList$new() 
            self$cats <- CatList$new()
            self$add_cat(model = "orange")
            self$add_cat(model = "grey")
            self$add_cat(model = "black")
            self$add_cat(model = "red")
        },
        
        join = function(player_id) {
            player <- new_player()
            self$players$add(player)
            if (!self$game_is_running) {
                self$start_game()
            }
            self$events$broadcast(new_event("add-player", player))
            
            list(
                player_id = player$id,
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
            # ...
            invisible(self)
        },
        
        add_cat = function(model) {
            cat <- new_cat(model)
            self$cats$add(cat)
            self$events$broadcast(new_event("add-cat", cat))
            return(cat$id)
        },
        
        remove_cat = function(cat_id) {
            if (self$cats$is_empty()) {
                self$end_game() # Players won
            }
            self$events$broadcast(new_event("remove-cat", cat_id))
        },
        
        move_cats = function() {
            # ...
        },
        
        start_game = function() {
            self$game_is_running = TRUE
            #self$run_game_loop()
            invisible(self)
        },
        
        end_game = function() {
            self$game_is_running <- FALSE. # will stop the game loop on next iteration
        },
        
        run_game_loop = function() {
            while (self$game_is_running) {
                move_cats()
                later::later(self$run_game_loop, 0.5)
            }
        },
        
        events = NULL,
        players = NULL,
        cats = NULL,
        game_is_running = FALSE
    )
)
