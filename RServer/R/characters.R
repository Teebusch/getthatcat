
PlayerList <- R6::R6Class(
    "PlayerList",
    
    public = list(
        add = function(player) {
            private$players <- append(private$players, list(player))
            invisible(self)
        },
        
        remove = function(player_id) {
            private$players <- private$players |>
                purrr::discard(\(x) identical(x$id, player_id))
            invisible(self)
        },
        
        get_all = function() {
            private$players
        },
        
        is_empty = function() {
            rlang::has_length(private$players)
        }
    ),
    
    private = list(
        players = list()
    )
)



CatList <- R6::R6Class(
    "CatList",
    
    public = list(
        add = function(cat) {
            private$cats <- append(private$cats, list(cat))
            invisible(self)
        },
        
        remove = function(cat) {
            private$cats <- private$cats |>
                purrr::discard(\(x) identical(x$id, cat_id))
            invisible(self)
        },
        
        get_all = function() {
            private$cats
        },
        
        is_empty = function() {
            rlang::has_length(private$cats)
        }
    ),
    
    private = list(
        cats = list()
    )
)


new_player <- function(id = get_uid()) {
    list(
        id = id,
        x = smp(5L, 7L, 9L, 11L),
        y = smp(5L, 7L, 9L),
        facing = smp('top', 'right', 'bottom', 'left'),
        name = make_random_name(),
        model = smp('red', 'orange', 'yellow', 'green', 'purple')
    )
}


new_cat <- function(model = smp('orange', 'gray', 'black', 'red')) {
    list(
        id = get_uid(),
        x = smp(5L, 7L, 9L, 11L),
        y = smp(5L, 7L, 9L),
        facing = smp('top', 'right', 'bottom', 'left'),
        model = model,
        lastMove = NULL,
        fuss = 5L,
        trapped = FALSE
    )
}
