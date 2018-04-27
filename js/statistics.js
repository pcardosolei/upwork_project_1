var T_STUDENT_095 = 1.645;

class Statistics {

    static confidenceInterval(sample) { //done!
        var n = sample.length;
        var somatorioValores = 0.0;
        var somatorioQuadradoValores = 0.0;
        for (var i = 0; i < sample.length; i = i + 1) {
            somatorioValores += sample[i];
            somatorioQuadradoValores += Math.pow(sample[i], 2);
        }
        return this.calculaIC(somatorioQuadradoValores, somatorioValores, n);
    }

    static calculaIC(somatorioQuadradoValores, somatorioValores, size) { //done
        var variancia = 0.0;
        var n = size;
        //Referência da fórmula: Site de AD - Ano:2000 - Período:1º - Assuntos:Simulação - 4a Questão
        variancia = ((somatorioQuadradoValores) / (n - 1)) - (Math.pow(somatorioValores, 2) / (n * (n - 1)));
        return T_STUDENT_095 * Math.sqrt(variancia / n);
    }

    static Mean(l) { //done
        var average = 0;
        for (var i = 0; i < l.length; i = i + 1) {
            average = average + l[i];
        }
        if (l.length > 0) {
            return (average / l.length);
        } else {
            //Console.WriteLine("ERROR: Can't average 0 numbers.");
            return 0;
        }
    }

    static Median(values) { //done
        if (values.length === 0) {
            return Number.NaN;
        }
        values.sort(function(a, b) { return a - b; });
        if (values.length % 2 === 1) {
            return values[(values.length + 1) / 2 - 1];
        } else {
            var lower = values[values.length / 2 - 1];
            var upper = values[values.length / 2];
            return (lower + upper) / 2.0;
        }
    }

    static GetValuesGreaterThan(values, limit, orEqualTo) { //done
            var aux = []
            for(var i = 0; i < values.length; i = i + 1){
                if(values[i] > limit || (values[i] === limit && orEqualTo)){
                    aux.push(values[i])
                }
            }
            return aux;
    }

    static GetValuesLessThan(values, limit, orEqualTo) { //done
            var aux = []
            for(var i = 0; i < values.length; i = i + 1){
                if(values[i] < limit || (values[i] === limit && orEqualTo)){
                    aux.push(values[i])
                }
            }
            return aux;
    }

    static Quartiles(values) {
        if (values.length < 3) {
            return [Number.NaN, Number.NaN, Number.NaN];
        }
        var median = this.Median(values);
        var lowerHalf = this.GetValuesLessThan(values, median, true);
        var upperHalf = this.GetValuesGreaterThan(values, median, true);
        var q1 = this.Median(lowerHalf);
        var q2 = this.Median(upperHalf);
        return [q1, median, q2];
    }

    static InterQuartileRange(values) { //done
        var quartiles = this.Quartiles(values);
        return quartiles[2] - quartiles[0];
    }

    static FilterOutLiers(values) { //done
        if (values.length <= 3) {
            return values;
        }
        var list = [];
        var quartiles = this.Quartiles(values);
        var iq = quartiles[2] - quartiles[0];
        var lower = quartiles[0];
        var upper = quartiles[2];
        var extremeUpperLimit = (iq * 3) + upper;
        var extremeLowerLimit = lower - (iq * 3);
        for (var i = 0; i < values.length; i = i + 1) {
            if (values[i] > extremeLowerLimit && values[i] < extremeUpperLimit) {
                list.push(values[i]);
            }
        }
        return list;
    }

    static StandardDeviation(values) {
        var ret = 0;
        if (values.length > 0) {
            //Compute the Average
            var avg = values.reduce(function(a, b) { return a + b; });
            avg /= values.length;
            //Perform the Sum of (value-avg)_2_2
            var sum = 0;
            for(var i = 0; i < values.length; i++){
                sum += Math.pow(values[i] - avg,2);
            }
            //Put it all together
            ret = Math.sqrt((sum) / (values.length - 1));
        }
        return ret;
    }

    static Variance(doubleList) { //done
        var res = this.StandardDeviation(doubleList);
        return (res * res);
    }

    static MSE(l1, l2) { //done
        var sum_sq = 0;
        var mse;
        for (var j = 0; j < l1.length; j = j + 1) {
            var err = l1[j] - l2[j];
            sum_sq += (err * err);
        }
        mse = sum_sq / (l1.length);
        return mse;
    }

    static RMSE(l1, l2) { //done
        return Math.sqrt(this.MSE(l1, l2));
    }
}

