import React from 'react';

const UploadFile = () => {
    const [fileSelected, setFileSelected] = React.useState<File>() // can also try string | blob
    const handleImageChange = function (e:React.ChangeEvent<HTMLInputElement>){
        const fileList =e.target.files; 
        if(!fileList) return;
        setFileSelected(fileList[0]);
    };

    const uploadFile = function(e: React.MouseEvent<HTMLSpanElement, MouseEvent>){
        if(fileSelected){
            const formData = new FormData();
            formData.append("image", fileSelected, fileSelected.name);
        }
    }
}

export default UploadFile;
