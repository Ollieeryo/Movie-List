const BASE_URL = 'https://movie-list.alphacamp.io/'
//INDEX為依照準則所設計的標準
const INDEX_URL = BASE_URL + 'api/v1/movies/'
//拿poster的URL
const POSTER_URL = BASE_URL + '/posters/'

//創造陣列放movies資料
const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || []

//選取search form節點
const searchForm = document.querySelector('#search-form')


//抓取卡片容器節點
const dataPanel = document.querySelector('#data-panel')
//製作輸出電影資料函式，為的是可以在不同情況下重複利用，也能拿這個函式輸入其他資料
function renderMovieList (data) {
  let rawHtml = ''

  //processing
  data.forEach(item => {
    //title, image
    // 控制一列幾個卡片，一個 row 有 12 個 col，class="col-sm-3"
    // 控制卡片間距 class="mb-2"
    // 注意 data-bs-toggle 是打開什麼modal樣式，data-bs-target 是指定互動的元件
    rawHtml += `<div class="col-sm-3">  
        <div class="mb-2"> 
          <div class="card">
            <img
              src="${POSTER_URL + item.image}" 
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer"> 
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
          </div>
        </div>
      </div>`
  })
  //btn-danger btn-remove-favorite 是進行刪除收藏清單的前置準備
  dataPanel.innerHTML = rawHtml
}

//修改modal裡電影資料的函式
function showMovieModal(id) {
  // 開始綁需要修改的元素
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  //axios 拿api電影資料的 id
  axios
    .get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date: ' + data.release_date
      modalDescription.innerText = data.description
      // 改圖片記得是 innerHTML，覆蓋掉整串 html content，並加上圖片連結來源
      modalImg.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="image-fluid">`
    })
    .catch((err) => console.log(err))
}

//建立刪除收藏清單函式
function removeFromFavorite(id) {
  //錯誤處理，一旦收藏清單是空的
  if (!movies || !movies.length) return
  
  //運用 findIndex 函式來找出點擊元素的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  //錯誤處理，或傳入的 id 在收藏清單中不存在，就結束這個函式
  if (movieIndex === -1) return
  //splice 刪除選擇的電影資料
  movies.splice(movieIndex, 1)

  localStorage.setItem("favoriteMovies", JSON.stringify(movies))
  //為了讓畫面在刪除電影後不需要再重新整理，這裡在渲染一次movies
  renderMovieList(movies)
}



//改modal內容的函式(事件委派)，注意不使用匿名函式有error時，才知道是哪個函式出錯了
//委派點擊 more 和 x (刪除) 事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // id 原本是字串，需要轉成數字，而 dataset-id 是 bootstrap 也有內建的樣式(data-id)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


renderMovieList(movies)

