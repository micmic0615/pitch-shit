import lodash from 'lodash';

lodash.isNilDeep = (value, string = "")=>{
	let scrap_array = string.split(".");
	let scrap_value = value;

	let scrap_index = 0;
	
	while(scrap_index < scrap_array.length){
		if (!lodash.isNil(scrap_value)){
			scrap_value = scrap_value[scrap_array[scrap_index].replace("_dot_",".")];
			scrap_index++
		} else {
			scrap_index += scrap_array.length
		}
	}
	
	return lodash.isNil(scrap_value)
}

lodash.isNilChain = (values)=>{
    let return_bool = false;
    values.forEach((value)=>{if (lodash.isNil(value)){return_bool = true}});
    return return_bool;
}

lodash.isEmptyString = (value)=>{
	return Boolean(!lodash.isString(value) || (lodash.isString(value) && value === ""));
}

lodash.isEmptyArray = (value)=>{
	return Boolean(!lodash.isArray(value) || (lodash.isArray(value) &&  value.length === 0));
}

lodash.isZero = (value)=>{
	return Boolean(lodash.isNumber(value) && value === 0)
}

lodash.setNotNil = (value, base)=>{
	return Boolean(!lodash.isNil(value)) ? value : base
}

lodash.checkChildren = (base, string)=>{
    if (!lodash.isNil(base)){
        let return_status = true;
        let current = base;
        let tree = string.split(".");
        for (let i = 0; i < tree.length; ++i) {
            let p = tree[i];
            if (!lodash.isNil(current[p])){
                current = current[p]
            } else {
                i += tree.length;
                return_status = false
            }
        };
        return return_status
    } else {
        return false;
    }
}

lodash.checkJSON = (string)=>{
	let return_bool;
	
	try {
		JSON.parse(string);
		return_bool = true;
	} catch(err){
		return_bool = false;
	}

    return return_bool
}

lodash.limitDecimal = (num, place = 2)=>{
    let divisor = Math.pow(10, place);
    return (Math.round(num*(divisor))/divisor);
}

lodash.uuid = (option)=>{
    let sequence_count = (lodash.isNumber(option)) ? option : 8;
    let sequence_digits = 8;
    let sequence_index = 8;
    let random_digit, random_string = "";

    random_string += Number(new Date().getTime()).toString(36) + "-";
    
    while(sequence_count > 0){
        sequence_index = sequence_digits;
        while(sequence_index > 0){
            random_digit = Math.round(Math.random()*35).toString(36);
            random_string += String(random_digit)
            sequence_index--
        }
        
        sequence_count--;
        if (sequence_count > 0){random_string += "-"};
    }

    return random_string
}

lodash.chunkInefficient = function(array, chunkSize) {
	// let array=this;
	return [].concat.apply([],
		array.map(function(elem,i) {
			return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
		})
	);
}

lodash.jsonClone = (clone_obj)=>{
    return JSON.parse(JSON.stringify(clone_obj))
}
lodash.randomItemFromArray = (array, extract)=>{
    let random_index = Math.min(Math.ceil(Math.random()*array.length), array.length - 1);
    let return_item = array[random_index];
    if (extract === true){array.splice(random_index, 1)}
    return return_item
}

lodash.randomListFromArray = (array, length)=>{
    let return_list = [];
    let processed_array = lodash.jsonClone(array);
    
    while(return_list.length < length){
        return_list.push(lodash.randomItemFromArray(processed_array, true));
    }

    return return_list;
}

lodash.makeUrl = (string)=>{
    return String(string).replace(/'/g, '').replace(/&/g, '').split("  ").join(" ").split(" ").join("-").toLowerCase();
}

lodash.objectToArray = (source)=>{
	let tamperedArray = _.jsonClone(source);
	if (!_.isArray(tamperedArray) && _.isObject(tamperedArray)){
		tamperedArray = Object.keys(tamperedArray).map((tamperedSize)=>{
			return tamperedArray[tamperedSize]
		})
	}

	return tamperedArray;
}

lodash.keyValueObject = (value, key)=>{
    let kvObject = {};

    if (_.isArray(value)){
        value.forEach((val, index)=>{kvObject[key[index]] = value[index]})
    } else {
        kvObject[key] = value;
    }

    return kvObject;
}

lodash.replaceSubstring = (base, substring, replacer = "")=>{
    if (lodash.isArray(substring)){
        let arrayReplacer = lodash.isArray(replacer);
        substring.forEach((subs, index)=>{
            if (arrayReplacer){
                base = base.split(subs).join(replacer[index]);
            } else {
                base = base.split(subs).join(replacer);
            }
        })
    } else {
        base = base.split(substring).join(replacer);
    }

    return base;
}

lodash.imgPath = (base)=>{
    if (!lodash.isEmptyString(base)){
        if (process.env.NODE_ENV === "development"){
            return base
        } else {
            if (!base.includes(process.env.ASSET_PATH)){
                return base.replace("/img/", "/" + process.env.ASSET_PATH + "img/")
            } else {
                return base
            }
        }
    } else {
        return ""
    }    
}

lodash.isEmail = (value)=>{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)){
        return (true)
    } else {
        return (false)
    }
}

lodash.isAlpha = (value)=> {
    let letters = /^[A-Za-z]+$/;
    if(value.match(letters)) {
        return true;
    }  else {
        return false;
    }
}


export default lodash;