export const CreateClassName = (classNames:any, additionalString:string = ""):string => {
    return Object.keys(classNames).map((className:string) => classNames[className] ? className : "").join(' ') + ' ' + additionalString;
}