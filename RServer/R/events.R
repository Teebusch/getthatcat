# Hub for Events
EventManager <- R6::R6Class(
    "EventManager",
    
    public = list(
        initialize = function(broadcast_to_console = FALSE) {
            private$broadcast_to_console = broadcast_to_console
        },
        
        subscribe = function(listener) {
            private$listeners <- append(private$listeners, list(listener))
            
            unsubscribe_fun <- \() self$unsubscribe(listener)
            invisible(unsubscribe_fun)
        },
        
        unsubscribe = function(listener) {
            private$listeners <- private$listeners |>
                dplyr::filter(!identical(listener, .env$listener))
            
            invisible(self)
        },
        
        broadcast = function(event) {
            if (private$broadcast_to_console) {
                print(event)
            }
            
            private$listeners |>
                purrr::walk(\(listener) listener(event))
            
            invisible(self)
        }
    ),
    
    private = list(
        broadcast_to_console = FALSE,
        listeners = list()
    )
)


# Individual event
new_event <- function(topic, data) {
    structure(
        class = "Event",
        .Data = list(
            topic = topic,
            data = data
        )
    )
}


as.list.Event <- function(x, ...) {
    list(topic = x$topic, data = x$data)

}


# Generic for Printing an event
print.Event <- function(x, ...) {
    sprintf("Event on topic '%s'\n", x$topic) |>
        cat()
}