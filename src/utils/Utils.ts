export const CreateClassName = (classNames:any, additionalString:string = ""):string => {
    return Object.keys(classNames).map((className:string) => classNames[className] ? className : "").join(' ') + ' ' + additionalString;
}

export const ClassNameHelper = (...args: (string | {[key: string]: boolean})[]):string => args.map(argument => {
    if(typeof argument === 'string'){
        return argument
    } else if(typeof argument === 'object'){
        return Object.keys(argument).map((className:string)=> argument[className] ? className : "").join(' ')
    }
}).join(' ')