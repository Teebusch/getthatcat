# rlang::check_installed("shiny (>= 1.11.0)", reason = "Es werden UI-Features aus 1.11.0 verwendet")
# rlang::check_installed(c("R6", "bslib"))

library(shiny)

devmode(TRUE)

# --- Globaler Server ------------------------------------------------------------------------------

game_server <- GameServer$new() 


# --- Client --------------------------------------------------------------------------------------

server <- function(input, output, session) {
  
  # an/abmelden
  state <- game_server$join() 
  player_id <- state$player_id
  session$onSessionEnded(\() game_server$leave(player_id))
  session$sendCustomMessage("set-player-id", player_id)
  
  # State im Client herstellen
  purrr::walk(
    state$cats$get_all(), 
    \(cat) session$sendCustomMessage("add-cat", cat)
  )
  purrr::walk(
    state$players$get_all(), 
    \(player) session$sendCustomMessage("add-player", player)
  )
  
  # Auf Server Events reagieren
  game_server$events$subscribe(\(event) {
    e <- as.list(event)
    session$sendCustomMessage(e$topic, e$data)
  })
  
  # Auf Browser Events reagieren
  observeEvent(
    input[["player-request-move"]], {
    data <- input[["player-request-move"]]
    game_server$request_move(player_id, data$move)
  })

}


# --- UI Funktionen --------------------------------------------------------------------------------

ui <- htmlTemplate("template.html")


shinyApp(ui, server)