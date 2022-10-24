const BASE_URL = 'https://movie-list.alphacamp.io/'
//INDEX為依照準則所設計的標準
const INDEX_URL = BASE_URL + 'api/v1/movies/'
//拿poster的URL
const POSTER_URL = BASE_URL + '/posters/'

//創造陣列放movies資料
const movies = []
//創空陣列放過濾後的movie資料
let filteredMovies = []

//選取search form節點
const searchForm = document.querySelector('#search-form')


//抓取卡片容器節點
const dataPanel = document.querySelector('#data-panel')
//製作輸出電影資料函式，為的是可以在不同情況下重複利用，也能拿這個函式輸入其他資料
function renderMovieList (data) {
  let rawHtml = ''
  if (dataPanel.dataset.form === 'card-form') {
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    })
    dataPanel.innerHTML = rawHtml
  } else if (dataPanel.dataset.form === 'list-form') {
      data.forEach(item => {
        rawHtml += `
        <div class="col-8 border-top py-2">
          <span>${item.title}</span>
        </div>
        <div class="col-4 border-top py-2">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      `
    })
    dataPanel.innerHTML = rawHtml
  }
}

// 改變電影呈現模式 函式
function changeForm (form) {
  if (dataPanel.dataset.form === form) return 
  dataPanel.dataset.form = form
}

// 事件委託 處理按鈕 電影呈現模式
searchForm.addEventListener('click', function onSearFormClicked(event) {
  if (event.target.matches('#list-button')) {
    changeForm('list-form')
    renderMovieList(getMovieByPage(1))
  } else if (event.target.matches('#card-button')) {
    changeForm('card-form')
    renderMovieList(getMovieByPage(1))
  }
})


//處理paginator分頁功能，宣告一個頁面顯示幾個電影
const MOVIES_PER_PAGE = 12

//此函式功能為得到每一頁的電影資料，例如 page 為 1，則顯示第一頁的12部電影
function getMovieByPage (page) {
  // movies ? "movies" : "filterMovies"，完整電影資料跟使用者搜尋資料都需要被分頁
  // 宣告兩種電影分頁可能，如果過濾後的電影資料不是空的就放filteredMovies，反之就放 movies
  const data = filteredMovies.length ? filteredMovies : movies
  // page 1 -> movies 0 ~ 12 
  // 宣告每頁起始電影的資料號碼，ex: 1 - 1 = 0，0 * 12 = 0，就是從第 0 格 電影資料開始
  const starIndex = (page -1) * MOVIES_PER_PAGE
  
  // 回傳 電影資料切割結果，起始電影資料 + 12 部電影，注意 slice 不會回傳最後一個號碼 
  return data.slice(starIndex, starIndex + MOVIES_PER_PAGE)
}

//選取paginator元素節點
const paginator = document.querySelector('#paginator')

//製作渲染 paginator 分頁數量
function renderPaginator (amount) {
  // ex: 例如電影數量為 80 / 12 = 6....8 (需要無條件進位 Math.ceil)
  // 計算需要多少個分頁，取得分頁數量(7頁)
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  
  let rawHtml = ``
  // 渲染需要多少分頁的 html content
  for(let page = 1; page <= numberOfPages; page ++) {
    // 接著需要綁 data-page (綁在 <a> 按鈕上)， 來知道點擊哪個分頁的 page
    rawHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHtml
}

//事件委派在分頁按鈕上，哪個分頁就顯示哪頁內容
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 錯誤處理，如果點擊的元素不是 <a> </a> 的話，就停止函式
  if(event.target.tagName !== 'A') return
  
  // 宣告 點擊元素的頁面號碼，因為 dataset 都是字串，需要轉換成號碼
  const page = Number(event.target.dataset.page)
  renderMovieList(getMovieByPage(page))

})




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


//加入電影收藏清單函式(將使用者點擊到的那一部電影送進 local storage 儲存起來)
function addToFavorite(id) {
  //先把 localStorage 的資料拿出來，使用 || 來判斷 true 先左後右
  //取資料時要把資料轉成 js 格式 (JSON.parse)
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  //運用 find 函式來找出點擊元素 id 跟 movies 裡資料 id 相同的電影
  const movie = movies.find((movie) => movie.id === id)
  //設定條件防止同樣的電影被放進收藏清單，使用 .some()方法
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已在收藏清單!")
  }

  //接著把要收藏的電影放進 list，另外注意點擊到元素原本是物件，但是 localStorage 只能存字串，所以要用 JSON.parse 方法轉成 JS 的資料(陣列、物件)
  list.push(movie)
  
  //設定 setItem 存入 list (記得轉成 JSON 字串才能存進去)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

//改modal內容的函式(事件委派)，注意不使用匿名函式有error時，才知道是哪個函式出錯了
//委派點擊 more 和 + (收藏) 事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // id 原本是字串，需要轉成數字，而 dataset-id 是 bootstrap 也有內建的樣式(data-id)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//選取輸入格節點
const searchInput = document.querySelector('#search-input')
//監聽 searchForm，注意 form 的 預設是 submit
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 阻止 submit 預設重整畫面事件 (preventDefault)
  event.preventDefault()
  //選取 input.value 裡的值，並且 trim 刪除空白，toLowerCase 只要小寫
  const keyword = searchInput.value.trim().toLowerCase()

  //如果輸入值的長度是 0 (false) 是true 的話
  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }
 
  // filter 的寫法，概念是把每個movie title名稱跟輸入值相比對，如果有相符合的關鍵字，就留在filteredMovies的空陣列裡
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  
  //處理空白或沒有符合關鍵字時，頁面資訊應該是全部電影資料，等於filteredMovies陣列裡並沒有任何東西，所以長度是 0
  if (filteredMovies.length === 0) {
    //return結束函式
    return alert(`Cannot find movie with keyword: ${keyword}`)
  }
  
  // for of 的寫法 
  // for (const movie of movies) {
  //   //如果movies資料裡的有哪一筆title有跟輸入值相符合的話，就放進空陣列裡
  //   //注意 toLowerCase 也要有的，就是輸入值如何設置，這裡相匹配的條件也要一樣
  //   if(movie.title.toLowerCase().includes(keyword))
  //   filteredMovies.push(movie)
  // }
  
  //這裡也需要重新渲染搜尋後的 paginator 元素
  renderPaginator(filteredMovies.length)
  //改變頁面html渲染，只留搜尋到的電影資料
  renderMovieList(getMovieByPage(1))   
})




axios
  .get(INDEX_URL)
  .then(response => {
  //Array = 80
  //for of 取 value 為一種方法
  // for (const movie of response.data.results) {
  //   movies.push(movie)
  // }
  //...items 取值為另一種方法
  movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMovieByPage(1))
  })
  .catch((err) => console.log(err))

