import React from "react";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Octicon, { RepoForked, Star, Heart } from "@primer/octicons-react";
import "./Footer.css";

export default class Footer extends React.Component {
  constructor() {
    super();

    this.state = {
      stars: 0,
      forks: 0,
    };
  }

  componentDidMount() {
    fetch("https://api.github.com/repos/brchung/COVID-19-Visualizer")
      .then((res) => res.json())
      .then(
        (result) => {
          const { stargazers_count, forks_count } = result;
          this.setState({ stars: stargazers_count, forks: forks_count });
        },
        (error) => {
          console.log(error);
        }
      );
  }

  render() {
    return (
      <div className="footer">
        <div className="disclaimer">
          <Typography variant="h6">About the Data</Typography>
          <Typography variant="h7">It Changes Rapidly</Typography>
          <Typography variant="body2">
            This data changes quickly, so what’s shown may be out of date. Virus
            information may not always represent an accurate sum. Information
            about reported cases is also available on the World Health
            Organization site.
          </Typography>
          <Typography variant="h7">It Does Not Include All Cases</Typography>
          <Typography variant="body2">
            Confirmed cases are NOT all cases. They only include people who
            tested positive. Testing rules and availability vary from country to
            country.
          </Typography>
          <Typography variant="h7">Data Sources</Typography>
          <Typography variant="body2">
            <Link
              href="https://github.com/CSSEGISandData/COVID-19"
              color="secondary"
            >
              JHU CSSE
            </Link>
            {`, `}
            <Link href="https://www.who.int/" color="secondary">
              WHO
            </Link>
            {`, `}
            <Link
              href="https://www.cdc.gov/coronavirus/2019-ncov/index.html"
              color="secondary"
            >
              US CDC
            </Link>
            {`, `}
            <Link
              href="http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml"
              color="secondary"
            >
              NHC
            </Link>
            {`, `}
            <Link
              href="http://weekly.chinacdc.cn/news/TrackingtheEpidemic.htm"
              color="secondary"
            >
              CCDC
            </Link>
            {`, `}
            <Link
              href="https://www.chp.gov.hk/en/features/102465.html"
              color="secondary"
            >
              HK CHP
            </Link>
            {`, `}
            <Link
              href="https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases"
              color="secondary"
            >
              ECDC
            </Link>
            {`, `}
            <Link
              href="http://3g.dxy.cn/newh5/view/pneumonia."
              color="secondary"
            >
              DXY
            </Link>
            {`, `}
            <Link
              href="https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases/"
              color="secondary"
            >
              BNO
            </Link>
            {`, `}
            <Link
              href="https://coronavirus.1point3acres.com/"
              color="secondary"
            >
              1Point3Acres
            </Link>
            {`, `}
            <Link
              href="https://www.worldometers.info/coronavirus/"
              color="secondary"
            >
              Worldometer.info
            </Link>
            {`, and many other state/national government health deparments and local media reports.`}
          </Typography>
          <Typography variant="h7">Disclaimer</Typography>
          <Typography variant="body2">
            This website and its contents herein, including all data, mapping,
            and analysis, copyright 2020 Brian Chung, all rights reserved, is
            provided to the public strictly for general information, public
            health, educational, and academic research purposes only. All the
            information was collected from multiple publicly available data
            sources that do not always agree. While we will try our best to keep
            the information up to date and correct, we make no representations
            or warranties of any kind, express or implied, about the
            completeness, accuracy, reliability, with respect to the website or
            the information. We do not bear any legal responsibility for any
            consequence caused by the use of information provided. Reliance on
            the website for medical guidance or use of the website in commerce
            is strictly prohibited. Brian Chung hereby disclaims any and all
            representations and warranties with respect to the website,
            including accuracy, fitness for use, and merchantability. Screen
            shots of the website are permissible so long as you provide
            appropriate credit.
          </Typography>
        </div>
        <br></br>
        <Link
          href="https://github.com/brchung/COVID-19-Visualizer"
          color="inherit"
        >
          <Typography variant="body2">
            Made with <Octicon icon={Heart} /> by Brian Chung
          </Typography>
          <Typography variant="body2">
            <Octicon icon={RepoForked} />
            {` ${this.state.forks}`} <Octicon icon={Star} />
            {` ${this.state.stars}`}
          </Typography>
        </Link>
        <br></br>
        <Typography variant="body2">
          {`Built with `}
          <Link href="https://reactjs.org/" color="secondary">
            React
          </Link>
          {`, `}
          <Link href="https://nodejs.org/en/" color="secondary">
            Node.js
          </Link>
          {`, `}
          <Link href="https://material-ui.com/" color="secondary">
            Material UI
          </Link>
          {`, and `}
          <Link href="https://deck.gl/" color="secondary">
            Deck.Gl
          </Link>
        </Typography>
        <Typography variant="body2">Copyright © 2020 Brian Chung</Typography>
      </div>
    );
  }
}
