port module Main exposing (main)

import Browser
import Json.Encode as Encode
import Html exposing (Html, div, text)

port loadStl  : (String -> msg) -> Sub msg
port sendMesh : Encode.Value -> Cmd msg


main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = \_ -> div [] []
        }

type alias Model = {}


-- Init
init : () -> (Model,Cmd Msg)
init _ = ({}, Cmd.none)

type Msg = 
  GoStl String

-- Subscription
subscriptions model =
    loadStl GoStl

-- Update
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    GoStl stlText ->
        let 
          verts = String.split "\n" stlText
            |> List.filterMap parseVertex

          mesh =
            { vertices = verts
            , faces = makeTriangleFaces (List.length verts)
            }
        in
          ( model, sendMesh (encodeMesh mesh) )


-- Types
type alias Vertex = { x: Float, y: Float, z: Float }
type alias Mesh = 
  { vertices : List Vertex
  , faces : List (List Int)
  }

parseVertex : String -> Maybe Vertex
parseVertex line = 
  case String.words line of 
    ["vertex" , x_str, y_str, z_str] -> 
      Just
        { x = String.toFloat x_str |> Maybe.withDefault 0
        , y = String.toFloat y_str |> Maybe.withDefault 0
        , z = String.toFloat z_str |> Maybe.withDefault 0
        }
    _ ->
      Nothing

makeTriangleFaces : Int -> List (List Int)
makeTriangleFaces count =
  List.range 0 ((count // 3) - 1)
    |> List.map 
      (\i -> 
        [ i*3, i*3+1, i*3+2 ]
      )

-- ToJson
encodeVertex : Vertex -> Encode.Value
encodeVertex v = 
  Encode.object 
  [ ("x", Encode.float v.x)
  , ("y", Encode.float v.y)
  , ("z", Encode.float v.z)
  ]

encodeMesh : Mesh -> Encode.Value
encodeMesh mesh = 
  Encode.object 
    [ ("vertices", Encode.list encodeVertex mesh.vertices)
    , ("faces", Encode.list (Encode.list Encode.int) mesh.faces)
    ]