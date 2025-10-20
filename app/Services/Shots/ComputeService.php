<?php

namespace App\Services\Shots;

use App\Models\Shots\{DailySnapshotHeader,BalanceSnapshot};
use App\Repositories\Shots\FireflyRepository;
use Illuminate\Support\Facades\DB;

readonly class ComputeService
{
    public function __construct(private FireflyRepository $firefly){}

    public function getDailySummaries(int $limit=30):array
    {
        $headers=DailySnapshotHeader::orderBy('snapshot_date','desc')->limit($limit+1)->get()->keyBy('snapshot_date');
        $rows=BalanceSnapshot::select('header_id','currency_code',DB::raw('SUM(balance_raw)AS total'))
            ->whereIn('header_id',$headers->pluck('id'))->groupBy('header_id','currency_code')->get();
        $map=[];
        foreach($rows as $r){
            $h=$headers->firstWhere('id',$r->header_id);if(!$h)continue;
            $d=$h->snapshot_date->format('Y-m-d');
            $map[$d]??=['usd'=>0,'ngn'=>0,'unified'=>0,'sell'=>$h->sell_rate];
            if($r->currency_code==='USD')$map[$d]['usd']+=$r->total;
            if($r->currency_code==='NGN')$map[$d]['ngn']+=$r->total;
        }
        foreach($map as $d=>&$v){$v['unified']=$v['ngn']+$v['usd']*$v['sell'];}
        $dates=array_keys($map);$out=[];
        for($i=0;$i<min($limit,count($dates));$i++){
            $d=$dates[$i];$cur=$map[$d];$prev=$map[$dates[$i+1]]??$cur;
            $tx=$this->firefly->getDailyTransactionsTotals($d);
            $txUnified=($tx['NGN']??0)+($tx['USD']??0)*$cur['sell'];
            $change=($cur['unified']-$prev['unified'])-$txUnified;
            $out[]=['date'=>$d,'usd'=>round($cur['usd'],2),'ngn'=>round($cur['ngn'],2),
                    'unifiedNGN'=>round($cur['unified'],2),'transactions'=>round($txUnified,2),
                    'change'=>round($change,2)];
        }
        return $out;
    }

    public function getSeries(string $granularity='month',int $limit=12):array
    {
        $tx=$this->firefly->getPeriodTransactions($granularity,$limit);
        return array_map(fn($r)=>['period'=>$r->period,'Transactions'=>(float)$r->total,'Change'=>0,'Balance'=>0],$tx);
    }
}
