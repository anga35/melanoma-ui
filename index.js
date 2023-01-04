element=document.getElementsByClassName('upload-container')[0]
let canvas=document.createElement('canvas')

let image_dist=document.getElementById('image-cancer')
image_sample=document.getElementById('sample-container')
let files=null
let btn=null
let imageContainer=null
var preprocessingContainer=null
let pipelineFilter=null

function getGrayImage(image_mat){
    let grayFilter=new cv.Mat()
    cv.cvtColor(image_mat,grayFilter,cv.COLOR_BGR2GRAY)
    cv.imshow(canvas,grayFilter)
    canvas.toBlob((blob)=>{
        let grayImage=new File([blob],'gray_img.jpg',{type:'image/jpeg'})
        preprocessingContainer=document.getElementById('preprocessing-container')
        if(!preprocessingContainer){
    
            let centerBtn=document.getElementById('center-btn')
    
            centerBtn.insertAdjacentHTML(
                'afterend',`
                <div class="center-tag" id="preprocessing-bg">
                <div id="preprocessing-container">
                
                <div class="center-tag" >
                <h1 class="white-txt">Preprocessing Pipeline</h1>
                </div>
                <div id="pipeline">
                <div class="pipeline-container">
                <img id="pipeline-gray" src="">
                <p id="pipline-gray-text">GrayScaling</p>
                </div>
                <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                <lottie-player id="lotti-arrow" src="https://assets5.lottiefiles.com/packages/lf20_whbagrfi.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;"   autoplay></lottie-player>   
                
                <div class="pipeline-container">
                <img id="pipeline-normal" src="">
                <p id="pipline-gray-text">Normalization</p>
                </div>
                </div>
                </div>
                </div>`
            )
            
        }
        imageContainer=document.getElementById('pipeline-gray')
        reader.readAsDataURL(grayImage)
    })
    return grayFilter


}

function getNormalizedImage(image_mat){
    let normalFilter=new cv.Mat()
    cv.normalize(image_mat, normalFilter, 0, 255, cv.NORM_MINMAX);
    cv.imshow(canvas,normalFilter)
    canvas.toBlob((blob)=>{
        let normalImage=new File([blob],'normal_img.jpg',{type:'image/jpeg'})

        imageContainer=document.getElementById('pipeline-normal')
        reader.readAsDataURL(normalImage)
    })
    


}


const reader= new FileReader()




reader.onload=()=>{
console.log("File reading complete")
const base64Image=reader.result
imageContainer.src=base64Image
console.log(files[0])
if(!document.getElementById('sample-name')){
image_sample.insertAdjacentHTML('afterend',`<p id="sample-name">${files[0].name}</p>

<div id="center-btn">
<button class="btn">
<p class="btn-txt">Classify</p>

</button>

</div>`)

btn=document.getElementsByClassName("btn")[0]
btn.addEventListener('click',()=>{
var src=cv.imread(image_dist)
pipelineFilter=getGrayImage(src)

predict()

})

}
else{
    if(imageContainer.id=='image-cancer'){
        setTimeout(()=>{    var src=cv.imread(image_dist)
            pipelineFilter=getGrayImage(src)},1000)    

    }
    document.getElementById("sample-name").textContent=files[0].name
}

console.log(imageContainer.id)
if(imageContainer.id=='pipeline-gray'){
    console.log("YESS")
    getNormalizedImage(pipelineFilter)
}

}

element.addEventListener('dragenter',
(e)=>{
    e.preventDefault();
})
element.addEventListener('dragover',
(e)=>{
    e.preventDefault();
})
element.addEventListener('drop',
(e)=>{
    e.preventDefault();
    files=e.dataTransfer.files;

    imageContainer=image_dist
    reader.readAsDataURL(files[0])


})


let predict= async ()=>{
    let sampleFile=files[0]
    const formData=new FormData()
    formData.append('sample',sampleFile)

    let loadingIcon=document.getElementById('loading-icon')
    
    loadingIcon.style.display='flex'

    const response = await fetch('http://127.0.0.1:8000/api/predict/',
    {
        method:'POST',
        body:formData
    });

    if(response.ok){
        loadingIcon.style.display='none'
        console.log("File uploaded successfully")
        res=await response.json()
        console.log(res)
        res=(res==0) ? 'Benign' : 'Malignant'
            

        if(!document.getElementById('result')){
            loadingIcon.insertAdjacentHTML(
                'afterend',
                `<div class=center-tag >
                <p id="result">Result: ${res}</p>
                </div>`
                
            )
        }
        document.getElementById('result').innerHTML=`Result: ${res}`

    }
    else{
        console.log("File upload failed")
    }



}