package com.gistone.seimp.MyBatis.config;

/**
 * Created by qiang on 2017/10/11.
 */
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.DeleteProvider;
import org.apache.ibatis.annotations.InsertProvider;
import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.UpdateProvider;

import com.gistone.seimp.MyBatis.entity.TutorDynaSqlProvider;

public interface GetBySqlMapper {

    @SelectProvider(type=TutorDynaSqlProvider.class, method="findTutorByIdSql")
    List<Map> findRecords(String SQLAdapter);

    @SelectProvider(type=TutorDynaSqlProvider.class, method="findTutorByIdSql")
    Integer findrows(String SQLAdapter);

    @InsertProvider(type=TutorDynaSqlProvider.class, method="findTutorByIdSql")
    Integer insert(String SQLAdapter);

    @UpdateProvider(type=TutorDynaSqlProvider.class, method="findTutorByIdSql")
    Integer update(String SQLAdapter);

    @DeleteProvider(type=TutorDynaSqlProvider.class, method="findTutorByIdSql")
    Integer delete(String SQLAdapter);

}
