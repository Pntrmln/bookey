export const arFormazo = (ar) => {
	let arArr = Array.from(ar.toString());
  	let newAr = "";
	let l = arArr.length;
  	for (let i = l; i > 0; i--){
    	newAr += arArr[i - 1];
		if (l == 6){
			if ((i - 1) % 3 == 0){
				newAr += " ";
			}
		} else if (l == 5){
			if ((i - 1) == l % 3){
				newAr += " ";
			}
		} else {
			if ((i - 1) % 4 == 0 || (i - 1) == 1){
				newAr += " ";
			}
		}
  	}
	return newAr.split("").reverse().join("");
};