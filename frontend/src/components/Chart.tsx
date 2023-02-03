import * as d3 from 'd3';
import * as React from 'react';

const keyMapping: KeyMappings = {
    avgNumberOfDeliveriesPerDay: 'Deliveries Per Day',
    avgNumberOfExpiredBoxesOfFood: 'Total Expired Boxes',
    avgNumberOfUnfulfilledReferrals: 'Total Unfulfilled Referrals'
}

interface KeyMappings {
    [key: string]: string;
}

interface IProps {
    dataList: [string, number][];
}

interface IState {
}

class Chart extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    componentDidUpdate() {
        this.buildGraph(this.props.dataList)
    }

    ref!: SVGSVGElement;

    private buildGraph(data: [string, number][]) {
        // clear svg first in case we need to re-render
        d3.select(this.ref).selectAll("*").remove();

        const width = 900,
            scaleFactor = 10,
            barHeight = 40;

        const graph = d3.select(this.ref)
            .attr("width", width)
            .attr("height", barHeight * data.length);

        const bar = graph.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * barHeight + ")";
            });

        bar.append("rect")
            .attr("width", function (d) {
                return d[1] * scaleFactor / 10;
            })
            .attr("height", barHeight - 1);

        bar.append("text")
            .attr("x", function (d) { return (d[1] / 10 * scaleFactor) + 30; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function (d) { return `${d[1]} ${keyMapping[d[0]]}`; });

        // colour the bars (delivered: red, expired: blue, unfulfilled: green)
        bar.selectAll("rect")
            .attr("fill", function (d: [string, number]): string {
                if (d[0] === 'avgNumberOfDeliveriesPerDay') {
                    return 'red';
                } else if (d[0] === 'avgNumberOfExpiredBoxesOfFood') {
                    return 'blue';
                } else {
                    return 'green';
                }
            });


    }

    render() {
        return (
            <div className="svg" style={{ paddingTop: '50px' }}>
                {this.props.dataList.length > 0 ? <h3> Average number of Deliveries, Expired Boxes, and Unmet referrals over Simulations</h3> : null}
                <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref} width='900' height='200'></svg>
            </div>
        );
    }
}


export default Chart;