AlphaTribe API 

### GET HomeRoute

`http://localhost:4000/`

Server is Hosted in Linod:
`http://172-235-27-127.ip.linodeusercontent.com:4000/`

### POST SignUpUser


`http://localhost:4000/api/auth/signup`

Body:
```json
{
    "fullname": "Test User3",
    "username": "testuser3",
    "email": "testuser3@gmail.com",
    "bio": "Hello I'm a BackEnd dev.",
    "password": "testuser3"
}
```
### POST SignInUser

`http://localhost:4000/api/auth/signin`

Body:
```json
{
    "emailorUsername": "testuser3",
    "password": "testuser3"
}
```
## User Management:

### GET GetUser

Authorization Bearer Token `<token>`

`http://localhost:4000/api/user/66dea35ccaca8b36c87ba46d`

Here we are checking user ID
`/user/:userId`


### PUT UpdateUserProfile

Authorization Bearer Token `<token>`

`http://localhost:4000/api/user/profile/66dea35ccaca8b36c87ba46d`

Body:
```json
{
    "bio": "Hello I'm a BackEnd dev. Updated!"
}
```

Here we are checking user ID
`/user/profile/userId`


## Posts

### GET GetAllPost
Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/all/66ded39445619a46c49b960b`

Here we are checking user ID
`/post/all/userId`


### POST CreateAPost

Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/createpost/66ded39445619a46c49b960b`


Body:
```json
{
    "stockSymbol": "SNN",
    "title": "NMM Stock Delete",
    "tags": ["M stock", "P Stock"],
    "description": "To Delete this is a text that describes about the stock"
}
```
Here we are checking user ID.
`/post/createpost/userId`


### GET GetPostsWithFilters

Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/posts?stockSymbol=NMM`

### PUT GiveALikeToPost

Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/like/66ded39445619a46c49b960b/66ded75e324ed526a4a3ff55`

Here we are checking both user ID and post ID.
`/post/like/userId/postId`


### PUT GiveADislikeToPost
Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/unlike/66ded39445619a46c49b960b/66ded75e324ed526a4a3ff55`

Here we are checking both user ID and post ID.
`/post/unlike/userId/postId`


### PUT GiveAComment

Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/comment/66ded39445619a46c49b960b/66ded75e324ed526a4a3ff55?text=My comment Test for socket`

Here we are checking both user ID and post ID.
`/post/comment/userId/postId?text=comment text`


### DELETE DeleteAComment

Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/comment/66ded39445619a46c49b960b/66ded75e324ed526a4a3ff55/66df5997dd8f67613ce5e1c9`

Here we are checking both user ID and post ID.
`/post/comment/userId/postId`


### GET GetAPostWithPostID

Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/66ded39445619a46c49b960b/66ded75e324ed526a4a3ff55`

Here we are checking both user ID and post ID.
`/post/userId/postId`


### DELETE DeleteAPost

Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/delete/66ded39445619a46c49b960b/66df69b56404bd1944650014`

Here we are checking both user ID and post ID.
`/post/delete/userId/postId`


### GET Pagination

Authorization Bearer Token `<token>`

`http://localhost:4000/api/post/paginated?page=1&limit=1`