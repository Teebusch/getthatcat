
EntityList <- R6::R6Class(
    "EntityList",
    
    public = list(
        add = function(entity) {
            private$entities[[entity$id]] <- entity
            invisible(self)
        },
        
        remove = function(entity_id) {
            private$entities[[entity_id]] <- NULL
            invisible(self)
        },
        
        get = function(entity_id) {
            private$entities[[entity_id]]
        },
        
        set = function(entity_id, entity) {
            private$entities[[entity_id]] <- entity
            invisible(self)
        },
        
        get_all = function() {
            private$entities
        },
        
        is_empty = function() {
            rlang::has_length(private$entities)
        }
    ),
    
    private = list(
        entities = list()
    )
)


player_factory <- function() {
    models <- sample(c('red', 'orange', 'yellow', 'green', 'purple'))
    idx <- 1L
    
    function() {
        model <- models[[idx %% length(models)]]
        idx <<- idx + 1L
        list(
            id = get_uid(),
            x = smp(5L, 7L, 9L, 11L),
            y = 11L,
            facing = smp('top', 'right', 'bottom', 'left'),
            name = make_random_name(),
            model = smp('red', 'orange', 'yellow', 'green', 'purple')
        )
    }
}
    


cat_factory <- function() {
    
    positions <- sample(list(
        c(8,6), 
        c(9,6), 
        c(10,6), 
        c(4,7), 
        c(5,7), 
        c(6,7), 
        c(4,7), 
        c(5,7), 
        c(6,7), 
        c(7,9), 
        c(8,9), 
        c(9,9)
    ))
    models <- c('orange', 'gray', 'black', 'red')
    idx <- 1L
    
    function() {
        pos <- positions[[idx %% length(positions)]]
        model <- models[[idx %% length(models)]]
        idx <<- idx + 1L
        list(
            id = get_uid(),
            x = pos[1],
            y = pos[2],
            facing = smp('top', 'right', 'bottom', 'left'),
            model = model,
            lastMove = NULL,
            fuss = 5L,
            trapped = FALSE
        )
    }
}

new_player <- player_factory()
new_cat <- cat_factory()