package DBMS;

import org.junit.Test;

import java.util.Random;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;

public class DBAppTestsMS3 {
    @Test(timeout = 1000000)
    public void test0DenseIndex() throws Exception {
        FileManager.reset();

        DBApp.dataPageSize = 2;
        DBApp.indexPageSize = 5;
        String[] cols0 = {"mb", "nq0", "xh"};
        DBApp.createTable("bh9", cols0);
        for (int i = 0; i < 13; i++) {
            String[] record_bh9 = new String[cols0.length];
            for (int j = 0; j < cols0.length; j++) {
                record_bh9[j] = genRandString();
            }
            DBApp.insert("bh9", record_bh9);
        }
        DBApp.createDenseIndex("bh9", "xh");
        String idx = DBApp.getIndexRepresentation("bh9", "xh");
        String lastTrace = DBApp.getLastTrace("bh9");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("xh"));
        assertTrue("Trace should contain the execution time for dense index creation.", lastTrace.contains("execution time"));
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(au45j, r0@p6), (fm8b836, r0@p2), (i1jhe1, r0@p5), (k7jq3qt, r1@p2), (klyb909, r0@p4)], [(lct8, r0@p0), (mds1, r1@p1), (n9y7, r1@p5), (td4hpr, r1@p0), (tu18934, r0@p1)], [(v65s78x, r1@p3), (x67s3cv, r0@p3), (xff5g8q, r1@p4)]]",
                idx
                );
        DBApp.createDenseIndex("bh9", "nq0");
        idx = DBApp.getIndexRepresentation("bh9", "nq0");
        lastTrace = DBApp.getLastTrace("bh9");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("nq0"));
        assertTrue("Trace should contain the execution time for dense index creation.", lastTrace.contains("execution time"));
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(b630u, r1@p3), (cgt2880, r1@p5), (cx0z, r1@p4), (fq9ybv2, r0@p1), (fsj545y, r0@p6)], [(hs42i, r1@p2), (l4jkwd7, r0@p3), (n5jubo5, r1@p1), (o8vh4, r0@p4), (rvtzf09, r0@p2)], [(t251v3h, r1@p0), (um3f8, r0@p0), (yhp062, r0@p5)]]",
                idx
        );
        FileManager.reset();
    }

    @Test(timeout = 1000000)
    public void test1DenseIndex() throws Exception {
        FileManager.reset();

        DBApp.dataPageSize = 11;
        DBApp.indexPageSize = 24;

        String[] cols1 = {"a","b","c","d","e","f","g","h","i","j","k","l"};
        DBApp.createTable("br", cols1);
        String [][] records_br = new String[90][cols1.length];
        for(int i=0;i<90;i++)
        {
            records_br[i][0] = cols1[0]+i;
            for(int j=1;j<cols1.length;j++)
            {
                records_br[i][j] = cols1[j]+((i%(j+1)));
            }
            DBApp.insert("br", records_br[i]);
        }

        DBApp.createDenseIndex("br","b");
        String lastTrace = DBApp.getLastTrace("br");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("b"));
        DBApp.createDenseIndex("br","d");
        lastTrace = DBApp.getLastTrace("br");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("d"));
        DBApp.createDenseIndex("br","e");
        lastTrace = DBApp.getLastTrace("br");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("e"));
        DBApp.createDenseIndex("br","g");
        lastTrace = DBApp.getLastTrace("br");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("g"));
        DBApp.createDenseIndex("br","h");
        lastTrace = DBApp.getLastTrace("br");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("h"));
        DBApp.createDenseIndex("br","i");
        lastTrace = DBApp.getLastTrace("br");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("i"));
        DBApp.createDenseIndex("br","l");
        lastTrace = DBApp.getLastTrace("br");
        assertTrue("Trace should contain indication for dense index creation.", lastTrace.contains("Dense Index created") && lastTrace.contains("l"));
        String idx = DBApp.getIndexRepresentation("br", "b");
        assertTrue("Trace should contain the execution time for dense index creation.", lastTrace.contains("execution time"));
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(b0, r0@p0), (b0, r2@p0), (b0, r4@p0), (b0, r6@p0), (b0, r8@p0), (b0, r10@p0), (b0, r1@p1), (b0, r3@p1), (b0, r5@p1), (b0, r7@p1), (b0, r9@p1), (b0, r0@p2), (b0, r2@p2), (b0, r4@p2), (b0, r6@p2), (b0, r8@p2), (b0, r10@p2), (b0, r1@p3), (b0, r3@p3), (b0, r5@p3), (b0, r7@p3), (b0, r9@p3), (b0, r0@p4), (b0, r2@p4)], [(b0, r4@p4), (b0, r6@p4), (b0, r8@p4), (b0, r10@p4), (b0, r1@p5), (b0, r3@p5), (b0, r5@p5), (b0, r7@p5), (b0, r9@p5), (b0, r0@p6), (b0, r2@p6), (b0, r4@p6), (b0, r6@p6), (b0, r8@p6), (b0, r10@p6), (b0, r1@p7), (b0, r3@p7), (b0, r5@p7), (b0, r7@p7), (b0, r9@p7), (b0, r0@p8), (b1, r1@p0), (b1, r3@p0), (b1, r5@p0)], [(b1, r7@p0), (b1, r9@p0), (b1, r0@p1), (b1, r2@p1), (b1, r4@p1), (b1, r6@p1), (b1, r8@p1), (b1, r10@p1), (b1, r1@p2), (b1, r3@p2), (b1, r5@p2), (b1, r7@p2), (b1, r9@p2), (b1, r0@p3), (b1, r2@p3), (b1, r4@p3), (b1, r6@p3), (b1, r8@p3), (b1, r10@p3), (b1, r1@p4), (b1, r3@p4), (b1, r5@p4), (b1, r7@p4), (b1, r9@p4)], [(b1, r0@p5), (b1, r2@p5), (b1, r4@p5), (b1, r6@p5), (b1, r8@p5), (b1, r10@p5), (b1, r1@p6), (b1, r3@p6), (b1, r5@p6), (b1, r7@p6), (b1, r9@p6), (b1, r0@p7), (b1, r2@p7), (b1, r4@p7), (b1, r6@p7), (b1, r8@p7), (b1, r10@p7), (b1, r1@p8)]]",
                DBApp.getIndexRepresentation("br", "b")
        );
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(d0, r0@p0), (d0, r4@p0), (d0, r8@p0), (d0, r1@p1), (d0, r5@p1), (d0, r9@p1), (d0, r2@p2), (d0, r6@p2), (d0, r10@p2), (d0, r3@p3), (d0, r7@p3), (d0, r0@p4), (d0, r4@p4), (d0, r8@p4), (d0, r1@p5), (d0, r5@p5), (d0, r9@p5), (d0, r2@p6), (d0, r6@p6), (d0, r10@p6), (d0, r3@p7), (d0, r7@p7), (d0, r0@p8), (d1, r1@p0)], [(d1, r5@p0), (d1, r9@p0), (d1, r2@p1), (d1, r6@p1), (d1, r10@p1), (d1, r3@p2), (d1, r7@p2), (d1, r0@p3), (d1, r4@p3), (d1, r8@p3), (d1, r1@p4), (d1, r5@p4), (d1, r9@p4), (d1, r2@p5), (d1, r6@p5), (d1, r10@p5), (d1, r3@p6), (d1, r7@p6), (d1, r0@p7), (d1, r4@p7), (d1, r8@p7), (d1, r1@p8), (d2, r2@p0), (d2, r6@p0)], [(d2, r10@p0), (d2, r3@p1), (d2, r7@p1), (d2, r0@p2), (d2, r4@p2), (d2, r8@p2), (d2, r1@p3), (d2, r5@p3), (d2, r9@p3), (d2, r2@p4), (d2, r6@p4), (d2, r10@p4), (d2, r3@p5), (d2, r7@p5), (d2, r0@p6), (d2, r4@p6), (d2, r8@p6), (d2, r1@p7), (d2, r5@p7), (d2, r9@p7), (d3, r3@p0), (d3, r7@p0), (d3, r0@p1), (d3, r4@p1)], [(d3, r8@p1), (d3, r1@p2), (d3, r5@p2), (d3, r9@p2), (d3, r2@p3), (d3, r6@p3), (d3, r10@p3), (d3, r3@p4), (d3, r7@p4), (d3, r0@p5), (d3, r4@p5), (d3, r8@p5), (d3, r1@p6), (d3, r5@p6), (d3, r9@p6), (d3, r2@p7), (d3, r6@p7), (d3, r10@p7)]]",
                DBApp.getIndexRepresentation("br", "d")
        );
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(e0, r0@p0), (e0, r5@p0), (e0, r10@p0), (e0, r4@p1), (e0, r9@p1), (e0, r3@p2), (e0, r8@p2), (e0, r2@p3), (e0, r7@p3), (e0, r1@p4), (e0, r6@p4), (e0, r0@p5), (e0, r5@p5), (e0, r10@p5), (e0, r4@p6), (e0, r9@p6), (e0, r3@p7), (e0, r8@p7), (e1, r1@p0), (e1, r6@p0), (e1, r0@p1), (e1, r5@p1), (e1, r10@p1), (e1, r4@p2)], [(e1, r9@p2), (e1, r3@p3), (e1, r8@p3), (e1, r2@p4), (e1, r7@p4), (e1, r1@p5), (e1, r6@p5), (e1, r0@p6), (e1, r5@p6), (e1, r10@p6), (e1, r4@p7), (e1, r9@p7), (e2, r2@p0), (e2, r7@p0), (e2, r1@p1), (e2, r6@p1), (e2, r0@p2), (e2, r5@p2), (e2, r10@p2), (e2, r4@p3), (e2, r9@p3), (e2, r3@p4), (e2, r8@p4), (e2, r2@p5)], [(e2, r7@p5), (e2, r1@p6), (e2, r6@p6), (e2, r0@p7), (e2, r5@p7), (e2, r10@p7), (e3, r3@p0), (e3, r8@p0), (e3, r2@p1), (e3, r7@p1), (e3, r1@p2), (e3, r6@p2), (e3, r0@p3), (e3, r5@p3), (e3, r10@p3), (e3, r4@p4), (e3, r9@p4), (e3, r3@p5), (e3, r8@p5), (e3, r2@p6), (e3, r7@p6), (e3, r1@p7), (e3, r6@p7), (e3, r0@p8)], [(e4, r4@p0), (e4, r9@p0), (e4, r3@p1), (e4, r8@p1), (e4, r2@p2), (e4, r7@p2), (e4, r1@p3), (e4, r6@p3), (e4, r0@p4), (e4, r5@p4), (e4, r10@p4), (e4, r4@p5), (e4, r9@p5), (e4, r3@p6), (e4, r8@p6), (e4, r2@p7), (e4, r7@p7), (e4, r1@p8)]]",
                DBApp.getIndexRepresentation("br", "e")
        );
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(g0, r0@p0), (g0, r7@p0), (g0, r3@p1), (g0, r10@p1), (g0, r6@p2), (g0, r2@p3), (g0, r9@p3), (g0, r5@p4), (g0, r1@p5), (g0, r8@p5), (g0, r4@p6), (g0, r0@p7), (g0, r7@p7), (g1, r1@p0), (g1, r8@p0), (g1, r4@p1), (g1, r0@p2), (g1, r7@p2), (g1, r3@p3), (g1, r10@p3), (g1, r6@p4), (g1, r2@p5), (g1, r9@p5), (g1, r5@p6)], [(g1, r1@p7), (g1, r8@p7), (g2, r2@p0), (g2, r9@p0), (g2, r5@p1), (g2, r1@p2), (g2, r8@p2), (g2, r4@p3), (g2, r0@p4), (g2, r7@p4), (g2, r3@p5), (g2, r10@p5), (g2, r6@p6), (g2, r2@p7), (g2, r9@p7), (g3, r3@p0), (g3, r10@p0), (g3, r6@p1), (g3, r2@p2), (g3, r9@p2), (g3, r5@p3), (g3, r1@p4), (g3, r8@p4), (g3, r4@p5)], [(g3, r0@p6), (g3, r7@p6), (g3, r3@p7), (g3, r10@p7), (g4, r4@p0), (g4, r0@p1), (g4, r7@p1), (g4, r3@p2), (g4, r10@p2), (g4, r6@p3), (g4, r2@p4), (g4, r9@p4), (g4, r5@p5), (g4, r1@p6), (g4, r8@p6), (g4, r4@p7), (g4, r0@p8), (g5, r5@p0), (g5, r1@p1), (g5, r8@p1), (g5, r4@p2), (g5, r0@p3), (g5, r7@p3), (g5, r3@p4)], [(g5, r10@p4), (g5, r6@p5), (g5, r2@p6), (g5, r9@p6), (g5, r5@p7), (g5, r1@p8), (g6, r6@p0), (g6, r2@p1), (g6, r9@p1), (g6, r5@p2), (g6, r1@p3), (g6, r8@p3), (g6, r4@p4), (g6, r0@p5), (g6, r7@p5), (g6, r3@p6), (g6, r10@p6), (g6, r6@p7)]]",
                DBApp.getIndexRepresentation("br", "g")
        );
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(h0, r0@p0), (h0, r8@p0), (h0, r5@p1), (h0, r2@p2), (h0, r10@p2), (h0, r7@p3), (h0, r4@p4), (h0, r1@p5), (h0, r9@p5), (h0, r6@p6), (h0, r3@p7), (h0, r0@p8), (h1, r1@p0), (h1, r9@p0), (h1, r6@p1), (h1, r3@p2), (h1, r0@p3), (h1, r8@p3), (h1, r5@p4), (h1, r2@p5), (h1, r10@p5), (h1, r7@p6), (h1, r4@p7), (h1, r1@p8)], [(h2, r2@p0), (h2, r10@p0), (h2, r7@p1), (h2, r4@p2), (h2, r1@p3), (h2, r9@p3), (h2, r6@p4), (h2, r3@p5), (h2, r0@p6), (h2, r8@p6), (h2, r5@p7), (h3, r3@p0), (h3, r0@p1), (h3, r8@p1), (h3, r5@p2), (h3, r2@p3), (h3, r10@p3), (h3, r7@p4), (h3, r4@p5), (h3, r1@p6), (h3, r9@p6), (h3, r6@p7), (h4, r4@p0), (h4, r1@p1)], [(h4, r9@p1), (h4, r6@p2), (h4, r3@p3), (h4, r0@p4), (h4, r8@p4), (h4, r5@p5), (h4, r2@p6), (h4, r10@p6), (h4, r7@p7), (h5, r5@p0), (h5, r2@p1), (h5, r10@p1), (h5, r7@p2), (h5, r4@p3), (h5, r1@p4), (h5, r9@p4), (h5, r6@p5), (h5, r3@p6), (h5, r0@p7), (h5, r8@p7), (h6, r6@p0), (h6, r3@p1), (h6, r0@p2), (h6, r8@p2)], [(h6, r5@p3), (h6, r2@p4), (h6, r10@p4), (h6, r7@p5), (h6, r4@p6), (h6, r1@p7), (h6, r9@p7), (h7, r7@p0), (h7, r4@p1), (h7, r1@p2), (h7, r9@p2), (h7, r6@p3), (h7, r3@p4), (h7, r0@p5), (h7, r8@p5), (h7, r5@p6), (h7, r2@p7), (h7, r10@p7)]]",
                DBApp.getIndexRepresentation("br", "h")
        );
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(i0, r0@p0), (i0, r9@p0), (i0, r7@p1), (i0, r5@p2), (i0, r3@p3), (i0, r1@p4), (i0, r10@p4), (i0, r8@p5), (i0, r6@p6), (i0, r4@p7), (i1, r1@p0), (i1, r10@p0), (i1, r8@p1), (i1, r6@p2), (i1, r4@p3), (i1, r2@p4), (i1, r0@p5), (i1, r9@p5), (i1, r7@p6), (i1, r5@p7), (i2, r2@p0), (i2, r0@p1), (i2, r9@p1), (i2, r7@p2)], [(i2, r5@p3), (i2, r3@p4), (i2, r1@p5), (i2, r10@p5), (i2, r8@p6), (i2, r6@p7), (i3, r3@p0), (i3, r1@p1), (i3, r10@p1), (i3, r8@p2), (i3, r6@p3), (i3, r4@p4), (i3, r2@p5), (i3, r0@p6), (i3, r9@p6), (i3, r7@p7), (i4, r4@p0), (i4, r2@p1), (i4, r0@p2), (i4, r9@p2), (i4, r7@p3), (i4, r5@p4), (i4, r3@p5), (i4, r1@p6)], [(i4, r10@p6), (i4, r8@p7), (i5, r5@p0), (i5, r3@p1), (i5, r1@p2), (i5, r10@p2), (i5, r8@p3), (i5, r6@p4), (i5, r4@p5), (i5, r2@p6), (i5, r0@p7), (i5, r9@p7), (i6, r6@p0), (i6, r4@p1), (i6, r2@p2), (i6, r0@p3), (i6, r9@p3), (i6, r7@p4), (i6, r5@p5), (i6, r3@p6), (i6, r1@p7), (i6, r10@p7), (i7, r7@p0), (i7, r5@p1)], [(i7, r3@p2), (i7, r1@p3), (i7, r10@p3), (i7, r8@p4), (i7, r6@p5), (i7, r4@p6), (i7, r2@p7), (i7, r0@p8), (i8, r8@p0), (i8, r6@p1), (i8, r4@p2), (i8, r2@p3), (i8, r0@p4), (i8, r9@p4), (i8, r7@p5), (i8, r5@p6), (i8, r3@p7), (i8, r1@p8)]]",
                DBApp.getIndexRepresentation("br", "i")
        );
        assertEquals("The created index should be properly done into blocks and key values in it need to be sorted and should have pointers to location of record in table pages.",
                "[[(l0, r0@p0), (l0, r1@p1), (l0, r2@p2), (l0, r3@p3), (l0, r4@p4), (l0, r5@p5), (l0, r6@p6), (l0, r7@p7), (l1, r1@p0), (l1, r2@p1), (l1, r3@p2), (l1, r4@p3), (l1, r5@p4), (l1, r6@p5), (l1, r7@p6), (l1, r8@p7), (l10, r10@p0), (l10, r0@p2), (l10, r1@p3), (l10, r2@p4), (l10, r3@p5), (l10, r4@p6), (l10, r5@p7), (l11, r0@p1)], [(l11, r1@p2), (l11, r2@p3), (l11, r3@p4), (l11, r4@p5), (l11, r5@p6), (l11, r6@p7), (l2, r2@p0), (l2, r3@p1), (l2, r4@p2), (l2, r5@p3), (l2, r6@p4), (l2, r7@p5), (l2, r8@p6), (l2, r9@p7), (l3, r3@p0), (l3, r4@p1), (l3, r5@p2), (l3, r6@p3), (l3, r7@p4), (l3, r8@p5), (l3, r9@p6), (l3, r10@p7), (l4, r4@p0), (l4, r5@p1)], [(l4, r6@p2), (l4, r7@p3), (l4, r8@p4), (l4, r9@p5), (l4, r10@p6), (l4, r0@p8), (l5, r5@p0), (l5, r6@p1), (l5, r7@p2), (l5, r8@p3), (l5, r9@p4), (l5, r10@p5), (l5, r0@p7), (l5, r1@p8), (l6, r6@p0), (l6, r7@p1), (l6, r8@p2), (l6, r9@p3), (l6, r10@p4), (l6, r0@p6), (l6, r1@p7), (l7, r7@p0), (l7, r8@p1), (l7, r9@p2)], [(l7, r10@p3), (l7, r0@p5), (l7, r1@p6), (l7, r2@p7), (l8, r8@p0), (l8, r9@p1), (l8, r10@p2), (l8, r0@p4), (l8, r1@p5), (l8, r2@p6), (l8, r3@p7), (l9, r9@p0), (l9, r10@p1), (l9, r0@p3), (l9, r1@p4), (l9, r2@p5), (l9, r3@p6), (l9, r4@p7)]]",
                DBApp.getIndexRepresentation("br", "l")
        );
        FileManager.reset();
    }

    static Random random = new Random(7);
    private static int genRandNum(int max) {

        return (int) (random.nextDouble() * max);
    }

    static String genRandString() {
        char[] alphabet = "abcdefghijklmnopqrstuvwxyz".toCharArray();
        char[] digits = "0123456789".toCharArray();
        int nameSize = genRandNum(8);
        if (nameSize < 4)
            nameSize += 4;
        String res = "";
        res += alphabet[(genRandNum(alphabet.length))];
        for (int i = 1; i < nameSize; i++) {
            if (genRandNum(2) >= 1)
                res += alphabet[(genRandNum(alphabet.length))];
            else
                res += digits[(genRandNum(digits.length))];
        }
        return res;

    }
}