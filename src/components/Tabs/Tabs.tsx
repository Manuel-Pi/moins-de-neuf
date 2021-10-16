import React, { useState } from 'react';
import { ClassNameHelper } from 'pizi-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type TabsProps = {
    className?: string
    tabs: {title: any, content: any}[]
}

export const Tabs = ({ className = "", tabs = []}: TabsProps) => {
    const[current, setCurrent] = useState(0);



    return  <div className={"tabs " + (tabs.length > 1 ? "" : "solo")}>
                <div className="titles">
                {
                    tabs.map((tab, index) => <span className={index === current ? "active" : ""} onClick={ e => setCurrent(index)}>{tab.title}</span>)
                }
                </div>
                <div className="tabs-container">
                {
                    tabs.map((tab, index) => <div className={index === current ? "active" : ""}>{tab.content}</div>)
                }
                </div>
            </div>
};